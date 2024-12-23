-- Define the users table
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD name ON user TYPE string;
DEFINE FIELD email ON user TYPE string;
DEFINE FIELD emailVerified ON user TYPE datetime;
DEFINE FIELD image ON user TYPE string;

-- Define the accounts table (for OAuth providers)
DEFINE TABLE account SCHEMAFULL;
DEFINE FIELD userId ON account TYPE record(user);
DEFINE FIELD type ON account TYPE string;
DEFINE FIELD provider ON account TYPE string;
DEFINE FIELD providerAccountId ON account TYPE string;
DEFINE FIELD refresh_token ON account TYPE string;
DEFINE FIELD access_token ON account TYPE string;
DEFINE FIELD expires_at ON account TYPE int;
DEFINE FIELD token_type ON account TYPE string;
DEFINE FIELD scope ON account TYPE string;
DEFINE FIELD id_token ON account TYPE string;
DEFINE FIELD session_state ON account TYPE string;

-- Define the sessions table
DEFINE TABLE session SCHEMAFULL;
DEFINE FIELD sessionToken ON session TYPE string;
DEFINE FIELD userId ON session TYPE record(user);
DEFINE FIELD expires ON session TYPE datetime;

-- Define the verification tokens table (for email verification)
DEFINE TABLE verification_token SCHEMAFULL;
DEFINE FIELD identifier ON verification_token TYPE string;
DEFINE FIELD token ON verification_token TYPE string;
DEFINE FIELD expires ON verification_token TYPE datetime;

-- Define indexes for better query performance
DEFINE INDEX account_provider_providerAccountId ON account COLUMNS provider, providerAccountId UNIQUE;
DEFINE INDEX session_sessionToken ON session COLUMNS sessionToken UNIQUE;
DEFINE INDEX user_email ON user COLUMNS email UNIQUE;
DEFINE INDEX verification_token_token ON verification_token COLUMNS token UNIQUE;
DEFINE INDEX verification_token_identifier_token ON verification_token COLUMNS identifier, token UNIQUE;


-- Define table items
DEFINE TABLE items SCHEMALESS;