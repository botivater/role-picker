from __future__ import annotations

import json
import os
from dataclasses import dataclass

from redis.asyncio import Redis


@dataclass(frozen=True)
class RoleBinding:
    emoji: str
    role: str


class RedisStore:
    def __init__(self) -> None:
        self._redis = Redis(
            host=os.getenv("REDIS_HOST", "127.0.0.1"),
            port=int(os.getenv("REDIS_PORT", "6379")),
            db=int(os.getenv("REDIS_DB", "0")),
            decode_responses=True,
        )

    @staticmethod
    def message_key(message_id: int | str) -> str:
        return f"message-{message_id}"

    async def get_bindings(self, message_id: int | str) -> list[RoleBinding]:
        raw = await self._redis.get(self.message_key(message_id))
        if not raw:
            return []
        data = json.loads(raw)
        return [RoleBinding(emoji=item["emoji"], role=item["role"]) for item in data]

    async def set_bindings(self, message_id: int | str, bindings: list[RoleBinding]) -> None:
        payload = [{"emoji": item.emoji, "role": item.role} for item in bindings]
        await self._redis.set(self.message_key(message_id), json.dumps(payload))

    async def ensure_message(self, message_id: int | str) -> None:
        await self.set_bindings(message_id, [])

    async def delete_message(self, message_id: int | str) -> None:
        await self._redis.delete(self.message_key(message_id))

    async def exists(self, message_id: int | str) -> bool:
        return bool(await self._redis.exists(self.message_key(message_id)))


store = RedisStore()
