export class AdminItemService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async request(path, options = {}) {
        const response = await fetch(`${this.apiUrl}${path}`, {
            ...options,
            credentials: "include",
            headers: {
                Accept: "application/json",
                ...options.headers,
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        if (response.status === 204) {
            return null;
        }

        const body = await response.text();
        return body ? JSON.parse(body) : null;
    }

    getItems() {
        return this.request("/items");
    }

    getItem(id) {
        return this.request(`/items/${encodeURIComponent(id)}`);
    }

    addItem(item) {
        return this.request("/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });
    }

    editItem(id, item) {
        return this.request(`/items/${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });
    }

    removeItem(id) {
        return this.request(`/items/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    }
}
