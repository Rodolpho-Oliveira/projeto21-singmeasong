import { faker } from "@faker-js/faker";
import app from "../src/app.js";
import { prisma } from "../src/database.js";
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

describe("Upvote recommendation", () => {
    it("Upvote a recommendation and return status 200", async () => {
        const response = await supertest(app).post("/recommendations/1/upvote")
        expect(response.status).toEqual(200)
    })

    it("Try to upvote a recommendation that doesnt exist", async () => {
        const response = await supertest(app).post("/recommendations/9999/upvote")
        expect(response.status).toEqual(404)
    })
})

describe("Downvote recommendation", () => {
    it("Downvote a recommendation and return status 200 and return status 200", async () => {
        const response = await supertest(app).post("/recommendations/1/downvote")
        expect(response.status).toEqual(200)
    })

    it("Try to downvote a recommendation that doesnt exist and return status 404", async () => {
        const response = await supertest(app).post("/recommendations/9999/downvote")
        expect(response.status).toEqual(404)
    })

    it("Remove a recommendation if score is less than -5 and return status 200", async () => {
        const response = await supertest(app).post("/recommendations/3/downvote")
        const recommendation = await prisma.recommendation.findUnique({
			where:{ id: 3},
		})
        expect(recommendation).toBeNull()
        expect(response.status).toEqual(200)
    })
})

describe("Get recommendations", () => {
    it("Return last 10 recommendations and return status 200", async () => {
        const response = await supertest(app).get("/recommendations/")
        expect(response.status).toBe(200)
    })

    it("Return one recommendation by id and return status 200", async () => {
        const response = await supertest(app).get("/recommendations/1")
        expect(response.status).toBe(200)
    })

    it("Return no recommendation by id if doesnt exist and return status 404", async () => {
        const response = await supertest(app).get("/recommendations/999")
        expect(response.status).toBe(404)
    })

    it("Return a random recommendation and return status 200", async () => {
        const response = await supertest(app).get("/recommendations/random")
        expect(response.status).toBe(200)
    })

    it("Return no random recommendation if none exists and return status 404", async () => {
        const response = await supertest(app).get("/recommendations/random")
        expect(response.status).toBe(404)
    })

    it("Return a list of top recommendations and return status 200", async () => {
        const response = await supertest(app).get("/recommendations/top/5")
        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(5)
    })

    it("Return no top recommendation if doesnt exist and return status 404", async () => {
        const response = await supertest(app).get("/recommendations/top/5")
        expect(response.status).toBe(404)
        expect(response.body).toBe([])
    })
})