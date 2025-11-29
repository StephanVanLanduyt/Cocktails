from itertools import islice

from cocktails.core.garnishes import Garnish


class GarnishService:
    def get_garnish_by_name(self, name: str) -> Garnish:
        for garnish in Garnish:
            if garnish.value == name:
                return garnish

    def get_multi_garnish(self, skip: int = 0, limit: int = 100) -> list[Garnish]:
        return list(islice((garnish for garnish in Garnish), skip, skip+limit))
