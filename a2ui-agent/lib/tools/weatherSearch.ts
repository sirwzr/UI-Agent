// ===== 天气查询工具 =====
// 使用 wttr.in 免费 API（无需 key）
// 返回当前天气和预报数据

import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { appendLog } from "@/lib/debug/serverLogs";

interface WttrCondition {
  temp_C: string;
  temp_F: string;
  humidity: string;
  windspeedKmph: string;
  winddir16Point: string;
  weatherDesc: { value: string }[];
  weatherIconUrl: { value: string }[];
  FeelsLikeC: string;
  uvIndex: string;
  visibility: string;
  pressure: string;
  cloudcover: string;
}

interface WttrDay {
  date: string;
  avgtempC: string;
  mintempC: string;
  maxtempC: string;
  hourly: {
    tempC: string;
    weatherDesc: { value: string }[];
    weatherIconUrl: { value: string }[];
    windspeedKmph: string;
    humidity: string;
    chanceofrain: string;
  }[];
}

async function fetchWeather(city: string, days = 3): Promise<{
  current: Record<string, unknown>;
  forecast: Record<string, unknown>[];
} | null> {
  try {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=zh`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current_condition?: WttrCondition[];
      weather?: WttrDay[];
    };
    const current = data.current_condition?.[0];
    const weather = data.weather ?? [];

    return {
      current: current
        ? {
            temperature: `${current.temp_C}°C`,
            feelsLike: `${current.FeelsLikeC}°C`,
            humidity: `${current.humidity}%`,
            windSpeed: `${current.windspeedKmph} km/h`,
            windDirection: current.winddir16Point,
            condition: current.weatherDesc[0]?.value ?? "未知",
            icon: current.weatherIconUrl[0]?.value ?? "",
            uvIndex: current.uvIndex,
            visibility: `${current.visibility} km`,
            pressure: `${current.pressure} hPa`,
            cloudCover: `${current.cloudcover}%`,
          }
        : {},
      forecast: weather.slice(0, days).map((d) => ({
        date: d.date,
        avgTemp: `${d.avgtempC}°C`,
        minTemp: `${d.mintempC}°C`,
        maxTemp: `${d.maxtempC}°C`,
        hourly: d.hourly.slice(0, 8).map((h) => ({
          time: `${new Date(h as unknown as string).getHours()}:00`,
          temp: `${h.tempC}°C`,
          condition: h.weatherDesc[0]?.value ?? "",
          icon: h.weatherIconUrl[0]?.value ?? "",
          windSpeed: `${h.windspeedKmph} km/h`,
          humidity: `${h.humidity}%`,
          rainChance: h.chanceofrain ? `${h.chanceofrain}%` : "",
        })),
      })),
    };
  } catch {
    return null;
  }
}

export const weatherSearchTool = defineTool({
  name: "get_weather",
  description:
    "查询指定城市的实时天气和未来几天预报。返回温度、湿度、风速、天气状况、紫外线指数、能见度等数据。完全免费，无需任何 API key。用于天气看板、出行规划、穿衣建议等场景。",
  parameters: z.object({
    city: z.string().describe("城市名称，中文或英文，如 'Beijing'、'上海'、'Tokyo'"),
    days: z
      .number()
      .optional()
      .default(3)
      .describe("预报天数，1-7，默认 3"),
  }),
  execute: async ({ city, days }) => {
    const startTs = Date.now();
    const data = await fetchWeather(city, Math.min(days ?? 3, 7));

    if (!data) {
      appendLog({
        ts: startTs,
        type: "tool_call",
        detail: `get_weather: ${city} — failed`,
        duration: Date.now() - startTs,
        success: false,
      });
      return {
        success: false,
        error: `未能获取「${city}」的天气数据，请检查城市名称是否正确`,
        weather: null,
      };
    }

    appendLog({
      ts: startTs,
      type: "tool_call",
      detail: `get_weather: ${city} — ${data.current.temperature}, ${data.current.condition}`,
      duration: Date.now() - startTs,
      success: true,
    });

    return {
      success: true,
      city,
      current: data.current,
      forecast: data.forecast,
      hint: "天气数据来自 wttr.in，可用于填充 Statistic、Chart（温度趋势）、Timeline（逐小时预报）等组件。图标 URL 可直接用于 Image 组件。",
    };
  },
});
