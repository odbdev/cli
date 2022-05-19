(async () => {
    const content = await sql(`SELECT name FROM friend LIMIT COALESCE(@limit, 10)`);

    return Object.values(JSON.parse(content));
})();
