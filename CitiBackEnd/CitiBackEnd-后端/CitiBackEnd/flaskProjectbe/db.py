import sqlite3 as sql

import click
from flask import current_app, g
from flask.cli import with_appcontext


class user_info_db:
    def __init__(self, path, timeout):
        self.db = sql.connect(path, timeout=timeout)
        self.db.row_factory = sql.Row
        self.cursor = self.db.cursor()

    def close(self):
        self.db.close()

    def exec(self, sql, *args):
        try:
            self.cursor.execute(sql, args)
            self.db.commit()
            return True
        except Exception as e:
            print(e)
            self.db.rollback()
            raise Exception("execution error")

    def insert(self, sql, *args):
        try:
            self.cursor.execute(sql, args)
            self.db.commit()
            return True
        except Exception as e:
            print(e)
            self.db.rollback()
            raise Exception("insert error")

    def select(self, sql, *args):
        self.cursor.execute(sql, args)
        return self.cursor.fetchall()

    def update(self, openid, session_key):
        try:
            self.cursor.execute('UPDATE user SET session_key = ? WHERE openid = ?', (session_key, openid))
            self.db.commit()
        except:
            self.db.rollback()
            raise Exception('update error')


def init_db():
    g.db = user_info_db('users.db', 1000)


def get_db():
    if 'db' not in g:
        # g.db = sqlite3.connect(
        #     current_app.config['DATABASE'],
        #     detect_types=sqlite3.PARSE_DECLTYPES
        # )
        init_db()

    return g.db


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()


@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)


if __name__ == '__main__':
    db = user_info_db('users.db', 1000)

    try:
        # db.insert('insert into user values (?,?,?)', 's', 'ss', 'sss')
        a = db.select('SELECT * FROM user where session_key = ?', ('xx3'))
        a = [x for x in a]
        print(a[0][0])
    except Exception as e:
        print(e)
