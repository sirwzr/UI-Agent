// ===== 位置感知搜索工具 =====
// 使用 ip-api.com 免费 IP 定位（无需 API key）
// 获取用户城市、经纬度后附加到搜索查询中

import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { appendLog } from "@/lib/debug/serverLogs";

interface IpApiResult {
  city: string;
  regionName: string;
  country: string;
  lat: number;
  lon: number;
  query: string;
}

async function fetchLocation(): Promise<{ city: string; region: string; country: string; lat: number; lon: number } | null> {
  try {
    const res = await fetch("https://ip-api.com/json/?fields=city,regionName,country,lat,lon,query", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as IpApiResult;
    if (!data.city) return null;
    return {
      city: data.city,
      region: data.regionName,
      country: data.country,
      lat: data.lat,
      lon: data.lon,
    };
  } catch {
    return null;
  }
}

export const locationSearchTool = defineTool({
  name: "get_user_location",
  description:
    "获取用户当前 IP 对应的城市和经纬度。当用户查询「附近」「周边」「推荐餐厅」「附近的店」「酒店」「加油站」等位置相关需求时，必须先调用此工具获取位置，然后将城市名传入 web_search 的 location 参数进行本地化搜索。",
  parameters: z.object({}),
  execute: async () => {
    const startTs = Date.now();
    const location = await fetchLocation();
    if (!location) {
      appendLog({
        ts: startTs, type: "tool_call",
        detail: "get_user_location: failed to resolve",
        duration: Date.now() - startTs, success: false,
      });
      return {
        success: false,
        error: "无法获取位置信息，请使用其他方式指定城市",
        location: null,
      };
    }
    appendLog({
      ts: startTs, type: "tool_call",
      detail: `get_user_location: ${location.city}, ${location.region}, ${location.country}`,
      duration: Date.now() - startTs, success: true,
    });
    return {
      success: true,
      location: {
        city: location.city,
        region: location.region,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
      },
      hint: `用户位于 ${location.city}，${location.region}。搜索时应使用「${location.city}」作为位置关键词。`,
    };
  },
});
