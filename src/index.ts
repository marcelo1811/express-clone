import App from "./modules/app";

const app = new App();

app.get("/", (req, res) => {
  res.status(200).send({
    method: "get",
  });
});

app.post("/", (req, res) => {
  res.status(200).send({
    method: "post",
  });
});

app.patch("/", (req, res) => {
  res.status(200).send({
    method: "patch",
  });
});

app.put("/", (req, res) => {
  res.status(200).send({
    method: "put",
  });
});

app.delete("/", (req, res) => {
  res.status(200).send({
    method: "delete",
  });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
