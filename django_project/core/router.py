"""Router for multiple database."""

DEFAULT_DATABASE = 'default'


class Router(object):
    """A router to control all database operations on models."""

    def db_for_read(self, model, **hints):
        """Attempt to read."""
        return DEFAULT_DATABASE

    def db_for_write(self, model, **hints):
        """Attempt to write models."""
        return DEFAULT_DATABASE

    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations of models for same db."""
        if obj1._state.db == obj2._state.db:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Just allow migrations to default database."""
        return db == DEFAULT_DATABASE
