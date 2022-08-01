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

describe("Downvote recommendation", () => {
    it("Downvote a recommendation", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(true as any)
        jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(1 as any)
        jest.spyOn(recommendationRepository,"remove").mockResolvedValueOnce(null)
        await recommendationService.downvote(2)
        expect(recommendationRepository.find).toBeCalled()
        expect(recommendationRepository.updateScore).toBeCalled()
        expect(recommendationRepository.remove).not.toBeCalled()
    })

    it("Try to downvote a recommendation that doesnt exist", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(false as any)
        const promise = recommendationService.downvote(5)
        expect(promise).rejects.toHaveProperty("type", "not_found")
    })

    it("Remove a recommendation if score is less than -5", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(true as any)
        jest.spyOn(recommendationRepository,"updateScore").mockResolvedValueOnce({ score: -6 } as any)
        jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce(null)
        await recommendationService.downvote(6)
        expect(recommendationRepository.find).toBeCalled()
        expect(recommendationRepository.updateScore).toBeCalled()
        expect(recommendationRepository.remove).toBeCalled()
	})
})

describe("Get recommendations", () => {
    it("Return all recommendations", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(true as any)
        const result = await recommendationService.get()
        expect(recommendationRepository.findAll).toBeCalled()
        expect(result).not.toBeNull()
    })

    it("Return one recommendation by id", async () => {
        jest
          .spyOn(recommendationRepository, "find")
          .mockResolvedValueOnce({ id: 2,
            score: 0,
            name: "We Are the World",
            youtubeLink: "www.youtube.com/r"
        })

        const result = await recommendationService.getById(2)

        expect(result).toEqual({ id: 2,
            score: 0,
            name: "We Are the World",
            youtubeLink: "www.youtube.com/r"
        })
        expect(recommendationRepository.find).toBeCalled()
    })

    it("Return no recommendation by id if doesnt exist", async () => {
        jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null)
  
        const result = recommendationService.getById(999)
  
        expect(result).rejects.toHaveProperty("type", "not_found")
        expect(recommendationRepository.find).toBeCalled()
      })

    it("Return the right amount of recommendations", async () => {
        const recommendations = new Array(20)
        jest.spyOn(recommendationRepository, "getAmountByScore").mockResolvedValueOnce([...recommendations].slice(0, 10) as any)

        const result = await recommendationService.getTop(10)

        expect(recommendationRepository.getAmountByScore).toBeCalled()
        expect(result.length).toBe(10)
    })

    it("Return a random recommendation with score >= 10", async () => {
        const recommendations = [
          {
            id: 1,
            score: 4,
            name: "Herman Raynor",
            youtubeLink: "www.youtube.com/s",
          },
          {
            id: 2,
            score: 0,
            name: "We Are the World",
            youtubeLink: "www.youtube.com/r",
          },
        ]

        jest.spyOn(Math, "random").mockImplementation(() => {
          return 0.8
        })
        jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([recommendations[0]] as any)

        const result = await recommendationService.getRandom()
        expect(result).toEqual(recommendations[0])
        expect(recommendationRepository.findAll).toBeCalled()
        expect(recommendationRepository.findAll).toBeCalledWith({
          score: 10,
          scoreFilter: "lte",
        })
    })

    it("Return no random recommendation if none exists", async () => {
        jest.spyOn(Math, "random").mockImplementation(() => {
            return 0.5
        })
        jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([])
        const promise = recommendationService.getRandom()
        expect(promise).rejects.toHaveProperty("type", "not_found")
    })
})