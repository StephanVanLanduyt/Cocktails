class ItemNotFound(ValueError):
    def __init__(self, msg):
        self.msg = msg
        super().__init__(msg)


class MultipleItemsFound(Exception):
    def __init__(self, msg):
        self.msg = msg
        super().__init__(msg)


class ItemAlreadyExist(Exception):
    def __init__(self, msg, id):
        self.msg = msg
        self.id = id
        super().__init__(msg)


class RepositoryError(Exception):
    def __init__(self, msg="Repository not initialized correctly"):
        self.msg = msg
        super().__init__(msg)
