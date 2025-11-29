from itertools import islice

from cocktails.core.tags import Tag


class TagService:
    def get_tag_by_name(self, name: str) -> Tag:
        for tag in Tag:
            if tag.value == name:
                return tag

    def get_multi_tag(self, skip: int = 0, limit: int = 100) -> list[Tag]:
        return list(islice((tag for tag in Tag), skip, skip+limit))
