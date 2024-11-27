-- =========================================
-- AUTHENTICATION AND AUTHORIZATION SCHEMA
-- =========================================

-- ------------------------------
-- NAMESPACE AND DATABASE
-- ------------------------------

USE NS ctw DB topsveltekit;

-- ------------------------------
-- TABLE DEFINITIONS
-- ------------------------------

-- User table - stores user information
DEFINE TABLE user SCHEMAFULL
    PERMISSIONS
    FOR select FULL  -- Allow checking for existing users during registration
    FOR create FULL
    FOR update WHERE id = $auth.id
    FOR delete WHERE id = $auth.id;

-- ------------------------------
-- FIELD DEFINITIONS
-- ------------------------------

DEFINE FIELD email ON user TYPE string
    ASSERT string::is::email($value)
    PERMISSIONS
    FOR select FULL;  -- Allow email field to be queried

DEFINE FIELD password ON user TYPE option<string>  -- Made password optional
    PERMISSIONS
    FOR select FULL;  -- Allow password access during login

DEFINE FIELD name ON user TYPE option<string>;

DEFINE FIELD image ON user TYPE option<string>;

DEFINE FIELD provider ON user TYPE string
    ASSERT $value = NONE OR $value INSIDE ['email', 'google', 'github']
    DEFAULT 'email';

DEFINE FIELD provider_id ON user TYPE option<string>;

DEFINE FIELD last_login ON user TYPE datetime
    DEFAULT time::now();

-- ------------------------------
-- INDEX DEFINITIONS
-- ------------------------------

DEFINE INDEX email_index ON user FIELDS email UNIQUE;
DEFINE INDEX provider_index ON user FIELDS provider, provider_id;

-- ------------------------------
-- ACCESS DEFINITIONS
-- ------------------------------

-- Define JWT access for AuthJS integration
DEFINE ACCESS auth_access ON DATABASE
    TYPE JWT
    ALGORITHM HS512
    KEY "AkaYYYBOXs1oaq9HSkhWMarTkH0Jqla/KTD+JqFbsPI9Y9gnzSp7m6DVti95SVDI4Z2dnqArfOlIBBwiWM3Iiw=="
    AUTHENTICATE {
        IF $token.iss != "surrealdb-auth" {
            THROW "Invalid token issuer"
        };
        IF $token.aud != "surrealdb-auth" {
            THROW "Invalid token audience"
        };
    };

-- ------------------------------
-- AUTHENTICATION FLOW
-- ------------------------------
-- Required JWT claims:
-- * exp: Token expiration time
-- * ac: Access method name ("auth_access")
-- * ns: Namespace ("test")
-- * db: Database name ("testdb")
-- * iss: Token issuer ("surrealdb-auth")
-- * aud: Token audience ("surrealdb-auth")
