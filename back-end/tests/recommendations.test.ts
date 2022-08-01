import { faker } from "@faker-js/faker";
import app from "../src/app.js";
import supertest from "supertest";

describe("Create recommendantion", () => {
    it("Add a new recommendation and return status 201", async () => {
        const response = await supertest(app).post("/recommendations").send({
            name: faker.music.songName() , youtubeLink: `www.youtube.com/${faker.random.alpha()}`
        })
        expect(response.status).toEqual(201)
    })

    it("Recommendation already exist and return status 409", async () => {
        const response = await supertest(app).post("/recommendations").send({
            name: "Herman Raynor" , youtubeLink: `www.youtube.com/s`
        })
        expect(response.status).toEqual(409)
    })

    it("Get recommendation wrong inputs and return status 422", async () => {
        const response = await supertest(app).post("/recommendations").send({
            name: 123 , youtubeLink: 321
        })
        expect(response.status).toEqual(422)
    })
})