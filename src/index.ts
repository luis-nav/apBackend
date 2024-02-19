import app from "./app";

const port:number = 3000;

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
})