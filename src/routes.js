import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
    {
        method: "GET",
        path: buildRoutePath("/tasks"),
        handler: (req, res) => {
            const { search } = req.query;

            const tasks = database.select(
                "tasks",
                search
                    ? {
                        title: search,
                        description: search,
                    }
                    : null
            );

            return res.end(JSON.stringify(tasks));
        },
    },
    {
        method: "POST",
        path: buildRoutePath("/tasks"),
        handler: (req, res) => {
            const { title, description } = req.body;

            if (!description) {
                return res.end(JSON.stringify({ message: "Descrição da tarefa é obrigatória" }));
            }

            if (!title) {
                return res.end(JSON.stringify({ message: "Título da tarefa é obrigatório" }));
            }

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            database.insert("tasks", task);

            return res.writeHead(201).end();
        },
    },
    {
        method: "PUT",
        path: buildRoutePath("/tasks/:id"),
        handler: (req, res) => {
            const { id } = req.params;
            const { title, description } = req.body;

            const taskExists = database.select("tasks", { id });

            if (!taskExists.length) {
                return res.end(JSON.stringify({ message: "Tarefa inexistente" }));
            }

            const newData = {
                title: title || taskExists[0].title,
                description: description || taskExists[0].description,
            }

            database.update("tasks", id, {
                ...taskExists[0],
                ...newData
            });

            return res.writeHead(204).end();
        },
    },
    {
        method: "DELETE",
        path: buildRoutePath("/tasks/:id"),
        handler: (req, res) => {
            const { id } = req.params;

            const taskExists = database.select("tasks", { id });

            if (!taskExists.length) {
                return res.end(JSON.stringify({ message: "Tarefa inexistente" }));
            }

            database.delete("tasks", id);

            return res.writeHead(204).end();
        },
    },
    {
        method: "PATCH",
        path: buildRoutePath("/tasks/:id/complete"),
        handler: (req, res) => {
            const { id } = req.params;

            const taskExists = database.select("tasks", { id });

            if (!taskExists.length) {
                return res.end(JSON.stringify({ message: "Tarefa inexistente" }));
            }

            database.update(
                "tasks",
                id,
                taskExists[0].completed_at
                    ? { ...taskExists[0], completed_at: null }
                    : { ...taskExists[0], completed_at: new Date() }
            );

            return res.writeHead(204).end();
        },
    },
];
