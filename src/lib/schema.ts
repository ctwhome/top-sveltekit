export const schema = {
  version: 1,
  tables: {
    todos: {
      columns: {
        id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
        text: { type: 'TEXT', notNull: true },
        completed: { type: 'BOOLEAN', notNull: true, default: false }
      }
    }
  }
}

export type Schema = typeof schema
