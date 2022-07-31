import App from "./modules/app";

const app = new App();

interface User {
  id: number;
  name: string;
  age: number;
}

const users: User[] = [
  {
    id: new Date().getTime(),
    name: "teste",
    age: 20,
  },
];

app.get("/", (req, res) => {
  res.status(200).send({
    method: "express clone v1.0",
  });
});

app.get("/users/:userId", (req, res) => {
  const { userId } = req.params;
  const user = users.find((user) => user.id === Number(userId));
  res.status(200).send(user);
});

app.get("/users", (req, res) => {
  res.status(200).send(users);
});

app.post("/users", (req, res) => {
  const userData = req.body as Omit<User, "id">;
  const newUser = {
    id: new Date().getTime(),
    ...userData,
  };
  users.push(newUser);

  res.status(201).send(newUser);
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
