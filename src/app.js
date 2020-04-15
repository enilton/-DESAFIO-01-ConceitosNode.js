const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function isValidUuid(request, response, next){
  const { id } = request.params;
  if (!isUuid(id)){
    return response.status(400).json({ error: 'invalid project id'});
  }
  return next();
}

function existsRepo(request, response, next){
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if(repoIndex < 0) {
    return response.status(401).json({ error: 'repo not found '});
  }
  request.repoIndex = repoIndex;
  return next();   
}

app.use('/repositories/:id', isValidUuid, existsRepo);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repo = {
    id: uuid(), 
    title, 
    url, 
    techs, 
    likes:0
  }
  repositories.push(repo);
  return response.json(repo);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs }  = request.body
  let repo = repositories[request.repoIndex];
  repo.title = title;
  repo.url = url;
  repo.techs = techs;
  repositories[request.repoIndex] = repo;
  return response.json(repo);  
});

app.delete("/repositories/:id", (request, response) => {
  repositories.splice(request.repoIndex, 1);
  return response.status(204).json({ message: 'sucess' });
});

app.post("/repositories/:id/like",  isValidUuid, existsRepo, (request, response) => {
  let repo = repositories[request.repoIndex];
  repo.likes = repo.likes + 1;  
  repositories[request.repoIndex] = repo;
  return response.json(repo);  
});

module.exports = app;
