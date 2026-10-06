CREATE TABLE notes (
    id serial PRIMARY KEY,
    text text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO notes (text) VALUES ('Första anteckningen, skapad av db/init.sql');
