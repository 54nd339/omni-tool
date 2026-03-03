export interface DiagramTemplate {
  code: string;
  label: string;
}

export const DIAGRAM_TEMPLATES = {
  flowchart: {
    label: 'Flowchart',
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
  },
  sequence: {
    label: 'Sequence',
    code: `sequenceDiagram
    participant A as Client
    participant B as Server
    participant C as Database
    A->>B: HTTP Request
    B->>C: Query
    C-->>B: Results
    B-->>A: JSON Response`,
  },
  classDiagram: {
    label: 'Class',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +fetch()
    }
    class Cat {
        +purr()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  },
  er: {
    label: 'ER',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int id
        date created
    }`,
  },
  gantt: {
    label: 'Gantt',
    code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements  :a1, 2024-01-01, 7d
    Design        :a2, after a1, 5d
    section Development
    Frontend      :b1, after a2, 14d
    Backend       :b2, after a2, 14d
    section Testing
    QA            :c1, after b1, 7d`,
  },
  pie: {
    label: 'Pie',
    code: `pie title Technology Stack
    "TypeScript" : 40
    "React" : 25
    "Node.js" : 20
    "Python" : 15`,
  },
  mindmap: {
    label: 'Mindmap',
    code: `mindmap
  root((Web Dev))
    Frontend
      React
      Vue
      Angular
    Backend
      Node.js
      Python
      Go
    Database
      PostgreSQL
      MongoDB
      Redis`,
  },
} as const satisfies Record<string, DiagramTemplate>;
