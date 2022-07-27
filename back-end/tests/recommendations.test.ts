import { faker } from "@faker-js/faker";
import app from "../src/app.js";
import supertest from "supertest";

describe("Create recommendantion", () => {
    it("Add a new recommendation and return status 201", async () => {
        const response = await supertest(app).post("/recommendations").send({
            name: faker.name.findName() , youtubeLink: `www.youtube.com/${faker.random.alpha()}`
        })
        expect(response.status).toEqual(201)
    })
})