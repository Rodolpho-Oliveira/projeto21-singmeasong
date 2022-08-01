import { recommendationRepository } from "../src/repositories/recommendationRepository.js"
import { recommendationService } from "../src/services/recommendationsService.js"
import { faker } from "@faker-js/faker"

jest.mock("../src/repositories/recommendationRepository")

describe("Create recommendation", () => {
    it("Create a recommendation", async () => {
        jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(null)
        jest.spyOn(recommendationRepository, "create").mockResolvedValueOnce(null)
        await recommendationService.insert({name: faker.random.words(), youtubeLink: `https://www.youtube.com/${faker.random.alpha()}`})
        expect(recommendationRepository.findByName).toBeCalled()
		expect(recommendationRepository.create).toBeCalled()
    })

    it("Create no recommendation if it already exist", async () => {
        jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(true as any)
        const promise = recommendationService.insert({name: "Herman Raynor", youtubeLink: `https://www.youtube.com/s`})
        expect(promise).rejects.toHaveProperty("type", "conflict")
    })
})

describe("Upvote recommendation", () => {
    it("Upvote a recommendation", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(true as any)
        jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(null)
        await recommendationService.upvote(1)
        expect(recommendationRepository.find).toBeCalled()
		expect(recommendationRepository.updateScore).toBeCalled()
    })

    it("Try to upvote a recommendation that doesnt exist", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(false as any)
        const promise = recommendationService.upvote(999)
        expect(promise).rejects.toHaveProperty("type", "not_found")
    })
})