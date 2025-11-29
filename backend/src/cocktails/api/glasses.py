from itertools import islice

from cocktails.core.glasses import Glass


class GlassService:
    def get_glass_by_name(self, name: str) -> Glass:
        for glass in Glass:
            if glass.value == name:
                return glass

    def get_multi_glass(self, skip: int = 0, limit: int = 100) -> list[Glass]:
        return list(islice((glass for glass in Glass), skip, skip+limit))
