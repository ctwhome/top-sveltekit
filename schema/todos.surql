-- Define the todos table
DEFINE TABLE todos SCHEMAFULL;

-- Define fields for the todos table
DEFINE FIELD title ON todos TYPE string;
DEFINE FIELD completed ON todos TYPE bool;
DEFINE FIELD created_at ON todos TYPE datetime;
DEFINE FIELD user ON todos TYPE record<user>;

-- Set required fields
DEFINE FIELD title ON todos ASSERT $value != NULL AND $value != "";
DEFINE FIELD completed ON todos ASSERT $value != NULL;
DEFINE FIELD created_at ON todos ASSERT $value != NULL;
DEFINE FIELD user ON todos ASSERT $value != NULL;

-- Set default values
DEFINE FIELD completed ON todos VALUE $value OR false;
DEFINE FIELD created_at ON todos VALUE $value OR time::now();

-- Define indexes
DEFINE INDEX userTodosIndex ON todos FIELDS user;

-- Define permissions
DEFINE SCOPE allusers SESSION 1d
  SIGNUP ( CREATE user SET email = $email, pass = crypto::argon2::generate($pass) )
  SIGNIN ( SELECT * FROM user WHERE email = $email AND crypto::argon2::compare(pass, $pass) );

-- Only allow users to access their own todos
DEFINE TABLE todos PERMISSIONS
  FOR select WHERE user = $auth.id
  FOR create WHERE user = $auth.id
  FOR update WHERE user = $auth.id
  FOR delete WHERE user = $auth.id;
