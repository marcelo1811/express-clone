import { User } from "./types/user.d";
import App from "./modules/app";

const app = new App();

let users: User[] = [
  {
    id: new Date().getTime(),
    name: "teste",
    age: 20,
  },
];

app.get("/", (_req, res) => {
  res.status(200).send({
    method: "express clone v1.0",
  });
});

app.get("/users/:userId", (req, res) => {
  const { userId } = req.params;
  const user = users.find((user) => user.id === Number(userId));
  res.status(200).send(user);
});

app.get("/users", (_req, res) => {
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

app.patch("/users/:userId", (req, res) => {
  const { userId } = req.params;
  const userData = req.body as Omit<User, "id">;

  let updatedUser;
  users = users.map((user) => {
    if (user.id === Number(userId)) {
      updatedUser = {
        ...user,
        ...userData,
      };
      return updatedUser;
    }
    return user;
  });

  res.status(200).send(updatedUser);
});

app.delete("/users/:userId", (req, res) => {
  const userToDelete = users.find(
    (user) => user.id === Number(req.params.userId)
  );
  users = users.filter((user) => user.id !== Number(req.params.userId));
  res.status(200).send(userToDelete);
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
