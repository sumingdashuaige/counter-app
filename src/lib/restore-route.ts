import { Counter } from './types';

/**
 * 决定启动后是否恢复到上次页面。
 * - 无记录或记录为首页 → 不跳转
 * - 用户从深链进入（initialPath !== '/'）→ 尊重深链，不跳转
 * - /counter/:id 对应计数器已不存在 → 回首页
 * - 未知路径 → 不跳转（保持默认）
 */
export function resolveRestoreRoute(
  lastRoute: string | null,
  initialPath: string,
  counterIds: string[]
): string | null {
  if (!lastRoute || lastRoute === '/') return null;
  if (initialPath !== '/') return null;
  if (lastRoute === '/history') return lastRoute;
  if (lastRoute.startsWith('/counter/')) {
    const id = lastRoute.slice('/counter/'.length);
    return counterIds.includes(id) ? lastRoute : '/';
  }
  return null;
}
