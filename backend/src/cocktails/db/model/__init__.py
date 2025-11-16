# pylint: disable=import-outside-toplevel

"""
Business models sub-package.
"""


def init_metadata():
    """
    Initialize the metadata object and return it.

    Automatically import all the modules defined in this sub-package. As a side
    effect the metadata object will be populated with all the information
    required to generate the db schema.

    The metadata object is also returned to be used by the caller.
    """
    import importlib
    import pkgutil

    from cocktails.db.model import cocktails
    from cocktails.db.model.metadata import Base

    package_path, package_name = __path__, __name__

    # Iterate over all modules in the business sub-package and load them
    for _, module_name, _ in pkgutil.iter_modules(package_path):
        absolute_module_name = f"{package_name}.{module_name}"

        _ = importlib.import_module(absolute_module_name)

    return Base.metadata
