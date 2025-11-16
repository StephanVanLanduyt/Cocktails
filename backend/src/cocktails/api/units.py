from itertools import islice

from cocktails.core.units import Unit


class UnitService:
    def get_unit_by_name(self, name: str) -> Unit:
        for unit in Unit:
            if unit.value == name:
                return unit

    def get_multi_unit(self, skip: int = 0, limit: int = 100) -> list[Unit]:
        return list(islice((unit for unit in Unit), skip, limit))
