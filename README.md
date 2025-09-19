# Hono API Template for Cloudflare Workers

This is a production-ready template for building robust and scalable APIs on Cloudflare Workers using the Hono framework. It features a service-oriented architecture, database integration with Drizzle ORM, and JWT-based authentication.

## ✨ Features

- **🚀 Modern Framework**: Built with [Hono](https://hono.dev/), a small, simple, and ultrafast web framework for the Edge.
- **🔒 Authentication**: Complete JWT-based authentication flow (register, login, password change, token verification).
- **🐘 Database ORM**: Integrated with [Drizzle ORM](https://orm.drizzle.team/) for type-safe database access to Cloudflare D1.
- **🗄️ Database Migrations**: Easy-to-use database migration management powered by `drizzle-kit`.
- **📐 Service-Oriented Architecture**: Clear separation of concerns with distinct layers for API routes, business logic (services), and data access (repositories).
- **🔧 Environment-based Configuration**: Simple configuration management for different environments.
- **🌐 TypeScript Ready**: Fully typed codebase for better developer experience and fewer runtime errors.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or another package manager like [pnpm](https://pnpm.io/)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)

## 🚀 Getting Started

Follow these steps to get your local development environment up and running.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd hono_template
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Configure Cloudflare D1

This project uses Cloudflare D1 for its database.

1.  **Create a D1 Database**:
    Use the Wrangler CLI to create a new D1 database. Replace `hono_template_db` with your desired database name.

    ```bash
    npx wrangler d1 create hono_template_db
    ```

2.  **Update `wrangler.jsonc`**:
    After creating the database, Wrangler will output the configuration details. Copy the `database_id` and paste it into your `wrangler.jsonc` file.

    ```json
    // wrangler.jsonc
    {
      // ...
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "hono_template_db",
          "database_id": "your-actual-database-id" // <-- PASTE YOUR ID HERE
        }
      ]
    }
    ```

### 4. Set Up Environment Variables

For local development, Wrangler uses a `.dev.vars` file for secrets.

1.  Create a file named `.dev.vars` in the root of the project.
2.  Add the following variables. You can generate a strong secret for `JWT_SECRET`.

    ```ini
    # .dev.vars
    JWT_SECRET="your-super-secret-jwt-key-that-is-long-and-random"
    JWT_EXPIRES_IN="7d"
    ```

### 5. Run Database Migrations

Apply the initial database schema to your local D1 database.

```bash
npm run db:migrate
```

This command executes the SQL files located in the `migrations` directory against your local database instance.

## 💻 Development

To start the local development server, run:

```bash
npm run dev
```

Wrangler will start a local server (usually at `http://localhost:8787`) that simulates the Cloudflare environment. The server supports hot-reloading, so changes to your code will be reflected automatically.

## 🗄️ Database Migrations Workflow

When you need to change the database schema, follow these steps:

1.  **Edit the Schema**: Modify the schema definitions in `src/data/schema.ts`.
2.  **Generate a Migration File**: Run the following command to generate a new SQL migration file based on your changes.

    ```bash
    npm run db:generate
    ```

    This will create a new `.sql` file in the `migrations` directory.

3.  **Apply the Migration**: Run the migration command to apply the changes to your database.

    ```bash
    # Apply to local database
    npm run db:migrate

    # Apply to remote/production database
    npx wrangler d1 migrations apply DB --remote
    ```

## ☁️ Deployment

To deploy your application to your Cloudflare account, run:

```bash
npm run deploy
```

This command will bundle your application, including all necessary code, and upload it to the Cloudflare global network.

## 📂 Project Structure

```
src/
├── api/          # API routing layer (v1, v2, etc.)
├── config/       # Environment configuration management
├── core/         # Business logic (services)
├── data/         # Data access layer (repositories, schema)
├── middleware/   # Hono middleware (auth, logger, etc.)
├── types/        # TypeScript type definitions
└── server.ts     # Main application entry point
```
