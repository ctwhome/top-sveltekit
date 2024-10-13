-- Up Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    title TEXT,
    archived BOOLEAN DEFAULT FALSE,
    messages JSONB DEFAULT '[]'::jsonb
);
-- Grant permissions to the database user (replace 'appuser' with the actual username if different)
GRANT SELECT, INSERT, UPDATE, DELETE ON chats TO appuser;
-- Grant sequence usage for the chats table
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO appuser;




ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
-- Policy for SELECT, INSERT, UPDATE, DELETE
CREATE POLICY user_select_policy ON chats FOR SELECT USING (user_id = current_setting('app.user_id')::INTEGER);
CREATE POLICY user_insert_policy ON chats FOR INSERT WITH CHECK (user_id = current_setting('app.user_id')::INTEGER);
CREATE POLICY user_update_policy ON chats FOR UPDATE USING (user_id = current_setting('app.user_id')::INTEGER);
CREATE POLICY user_delete_policy ON chats FOR DELETE USING (user_id = current_setting('app.user_id')::INTEGER);
ALTER TABLE chats FORCE ROW LEVEL SECURITY;

-- Insert sample data
SET app.user_id = '1';

INSERT INTO chats (user_id, title, started_at, archived, messages)
VALUES
    (
        -- (SELECT id FROM users WHERE email = 'alice@ctwhome.com' LIMIT 1),
        1,
        'Meeting with Jane',
        '2023-10-10',
        FALSE,
        '[
            {
                "user": "Hello, how are you?",
                "answers": {
                    "openai": "I''m an AI language model, so I don''t have feelings, but I''m functioning well and ready to assist you. How can I help you today?",
                    "gemini": "I''m doing well, thank you for asking! I''m an AI assistant, so I don''t have feelings in the same way humans do, but I''m functioning properly and ready to help. How can I assist you today?"
                }
            },
            {
                "user": "What is the meaning of life?",
                "answers": {
                    "openai": "The meaning of life is a philosophical question that has been debated for centuries. There''s no single, universally accepted answer. Some find meaning in relationships, personal growth, or contributing to society. Others believe it''s about happiness, fulfillment, or spiritual enlightenment. Ultimately, many philosophers and thinkers suggest that the meaning of life is what you make of it - it''s personal and can vary from individual to individual.",
                    "claude": "The meaning of life is a profound philosophical question that has been pondered throughout human history. There is no single agreed-upon answer. Some perspectives include: finding happiness and fulfillment, making the world a better place, pursuing knowledge and growth, connecting with others, or achieving spiritual enlightenment. Ultimately, many philosophers argue that we each need to find or create our own meaning in life."
                }
            }
        ]'::jsonb
    ),
    (
        1,
        'Marvin the robot',
        '2023-10-10',
        FALSE,
        '[
            {
                "user": "Can you explain quantum computing?",
                "answers": {
                    "openai": "Quantum computing is a type of computation that harnesses the unique properties of quantum mechanics to perform certain calculations much faster than classical computers. Key concepts include: 1) Qubits: Unlike classical bits (0 or 1), qubits can exist in multiple states simultaneously (superposition). 2) Entanglement: Qubits can be interconnected, allowing for complex computations. 3) Quantum algorithms: Specialized algorithms that take advantage of quantum properties to solve specific problems efficiently. Quantum computers have potential applications in cryptography, drug discovery, financial modeling, and more. However, they''re still in early stages of development and face challenges like maintaining qubit stability.",
                    "gemini": "Quantum computing is a cutting-edge field that uses the principles of quantum mechanics to process information in ways that classical computers can not. Here are the key points: 1) Qubits: Instead of classical bits (0 or 1), quantum computers use qubits, which can exist in multiple states at once (superposition). 2) Entanglement: Qubits can be interconnected, allowing for complex, parallel computations. 3) Quantum algorithms: Special algorithms designed to take advantage of quantum properties. 4) Potential applications: Cryptography, drug discovery, financial modeling, optimization problems. 5) Current state: Still experimental, with many technical challenges to overcome before becoming widely practical. Quantum computers are not meant to replace classical computers, but to complement them for specific, complex problems.",
                    "claude":"Quantum computing harnesses quantum mechanical phenomena like superposition and entanglement to perform computations. Unlike classical computers that use bits (0 or 1), quantum computers use qubits that can exist in multiple states simultaneously. This allows them to process certain types of information much more efficiently than classical computers, potentially solving problems in cryptography, optimization, and quantum simulation that are currently intractable. However, quantum computers are challenging to build and maintain due to the fragility of quantum states. While early quantum computers exist, they are still limited in capability and far from reaching their theoretical potential. The field continues to advance, with researchers working on improving qubit stability, error correction, and developing practical quantum algorithms."
                }
            }
        ]'::jsonb
    );


SET app.user_id = '2';

INSERT INTO chats (user_id, title, started_at, archived, messages)
VALUES
    (
        -- (SELECT id FROM users WHERE email = 'diamond@ctwhome.com' LIMIT 1),
        '2',
        'What is important',
        '2023-10-10',
        FALSE,
        '[
            {
                "user": "Can you explain quantum computing?",
                "answers": {
                    "openai": "Quantum computing is a type of computation that harnesses the unique properties of quantum mechanics to perform certain calculations much faster than classical computers. Key concepts include: 1) Qubits: Unlike classical bits (0 or 1), qubits can exist in multiple states simultaneously (superposition). 2) Entanglement: Qubits can be interconnected, allowing for complex computations. 3) Quantum algorithms: Specialized algorithms that take advantage of quantum properties to solve specific problems efficiently. Quantum computers have potential applications in cryptography, drug discovery, financial modeling, and more. However, they''re still in early stages of development and face challenges like maintaining qubit stability.",
                    "gemini": "Quantum computing is a cutting-edge field that uses the principles of quantum mechanics to process information in ways that classical computers can not. Here are the key points: 1) Qubits: Instead of classical bits (0 or 1), quantum computers use qubits, which can exist in multiple states at once (superposition). 2) Entanglement: Qubits can be interconnected, allowing for complex, parallel computations. 3) Quantum algorithms: Special algorithms designed to take advantage of quantum properties. 4) Potential applications: Cryptography, drug discovery, financial modeling, optimization problems. 5) Current state: Still experimental, with many technical challenges to overcome before becoming widely practical. Quantum computers are not meant to replace classical computers, but to complement them for specific, complex problems.",
                    "claude":"Quantum computing harnesses quantum mechanical phenomena like superposition and entanglement to perform computations. Unlike classical computers that use bits (0 or 1), quantum computers use qubits that can exist in multiple states simultaneously. This allows them to process certain types of information much more efficiently than classical computers, potentially solving problems in cryptography, optimization, and quantum simulation that are currently intractable. However, quantum computers are challenging to build and maintain due to the fragility of quantum states. While early quantum computers exist, they are still limited in capability and far from reaching their theoretical potential. The field continues to advance, with researchers working on improving qubit stability, error correction, and developing practical quantum algorithms."
                }
            }
        ]'::jsonb
    );
;


-- Down Migration
DROP TABLE chats;
-- DROP EXTENSION IF EXISTS "uuid-ossp"; -- Commented out as it requires ownership