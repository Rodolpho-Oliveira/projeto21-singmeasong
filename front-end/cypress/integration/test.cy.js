/// <reference types="cypress" />
/* global cy */
import { faker } from "@faker-js/faker"

const URL = "http://localhost:5000"

describe("Create recommendation", () => {
	it("Create a new recommendation", async () => {
		const recommendations = {
			name: faker.music.songName(),
			youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
		}
		cy.visit("http://localhost:3000/")
		cy.get("input[placeholder='Name']").type(recommendations.name)
		cy.get("input[placeholder='https://youtu.be/...']").type(
			recommendations.youtubeLink
		)
		cy.intercept("POST", `${URL}/recommendations`).as(
			"createRecommendation"
		)
		cy.get("button").click()
		cy.wait("@createRecommendation").then(({ response }) => {
			expect(response.statusCode).equal(201)
		})
	})
	it("Try to create a new recommendation if name is empty", async () => {
		const recommendations = {
			youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
		}
		cy.visit("http://localhost:3000/")
		cy.get("input[placeholder='https://youtu.be/...']").type(
			recommendations.youtubeLink
		)
		cy.intercept("POST", `${URL}/recommendations`).as(
			"createRecommendation"
		)
		cy.get("button").click()
		cy.wait("@createRecommendation").then(({ response }) => {
			expect(response.statusCode).equal(422)
		})
	})
	it("Try to create a new recommendation if youtube link is empty", async () => {
		const recommendations = {
			name: faker.music.songName(),
		}
		cy.visit("http://localhost:3000/")
		cy.get("input[placeholder='Name']").type(recommendations.name)
		cy.intercept("POST", `${URL}/recommendations`).as(
			"createRecommendation"
		)
		cy.get("button").click()
		cy.wait("@createRecommendation").then(({ response }) => {
			expect(response.statusCode).equal(422)
		})
	})
})

describe("Upvote a recommendation", () => {
    it("Upvote a recommendation", async () => {
        cy.createRecommendation()
        const id = 1

        cy.intercept("GET", `${URL}/recommendations`).as(
            "getRecommendations"
        )
        cy.visit("http://localhost:3000/")
        cy.wait("@getRecommendations")
        cy.get("article>div:nth-child(3)").then(div => {
            const score = parseInt(div.text())
            cy.intercept(
                "POST",
                `${URL}/recommendations/${id}/upvote`
            ).as("upvote")
            cy.get("#upvoteRecommendation").click()
            cy.wait("@upvote").then(({ response }) => {
                expect(response.statusCode).equal(200)
                cy.wait(500).then(() =>
                    expect(score + 1).equal(parseInt(div.text()))
                )
            })
        })
    })
})

describe("Downvote a recommendation", () => {
    it("Try to downvote a recommendation", async () => {
        cy.createRecommendation()
        const id = 1
        cy.intercept("GET", `${URL}/recommendations`).as(
            "getRecommendations"
        )
        cy.visit("http://localhost:3000/")
        cy.wait("@getRecommendations")
        cy.get("article>div:nth-child(3)").then(div => {
            const score = parseInt(div.text())
            cy.intercept(
                "POST",
                `${URL}/recommendations/${id}/downvote`
            ).as("downvote")
            cy.get("#downvoteRecommendation").click()
            cy.wait("@downvote").then(({ response }) => {
                expect(response.statusCode).equal(200)
                cy.wait(500).then(() =>
                    expect(score - 1).equal(parseInt(div.text()))
                )
            })
        })
    })
    it("Remove recommendation if score is less than -5", async () => {
        cy.createRecommendation(1, -5)
        const id = 1
        cy.intercept("GET", `${URL}/recommendations`).as(
            "getRecommendations"
        )
        cy.visit("http://localhost:3000/")
        cy.wait("@getRecommendations")

        cy.intercept(
            "POST",
            `${URL}/recommendations/${id}/downvote`
        ).as("downvote")
        cy.get("#downvoteRecommendation").click()
        cy.wait("@downvote").then(({ response }) => {
            expect(response.statusCode).equal(200)
            cy.wait(500).then(() =>
                cy.get("article>div:nth-child(3)").should("not.exist")
            )
        })
    })
})

describe("Get recommendations", () => {
    it("should only get 10 recommendations", async () => {
        cy.createRecommendation(15)
        cy.intercept("GET", `${URL}/recommendations`).as(
            "getRecommendations"
        )
        cy.visit("http://localhost:3000/")
        cy.wait("@getRecommendations").then(({ response }) => {
            expect(response.statusCode).equal(200)
            expect(response.body.length).equal(10)
            cy.get("#no-recommendations").should("not.exist")
        })
    })
    it("Try to get any recommendations if there are no recommendations", async () => {
        cy.intercept("GET", `${URL}/recommendations`).as(
            "getRecommendations"
        )
        cy.visit("http://localhost:3000/")
        cy.wait("@getRecommendations").then(({ response }) => {
            expect(response.statusCode).equal(200)
            expect(response.body.length).equal(0)
            cy.get("#no-recommendations").should("exist")
        })
    })
})
describe("Get a random recommendation", () => {
    it("Get a random recommendation", async () => {
        cy.createRecommendation(5)
        cy.intercept("GET", `${URL}/recommendations/random`).as(
            "getRecommendations"
        )
        cy.visit("http://localhost:3000/random")
        cy.wait("@getRecommendations").then(({ response }) => {
            expect(response.statusCode).equal(200)
            expect(response.body).not.equal(null)
            cy.get("#no-recommendations").should("not.exist")
        })
    })
})
describe("Get the top recommendations", () => {
    it("Get the top 10 recommendations", async () => {
        cy.createRecommendation(5, 100)
        cy.createRecommendation(5, 200)
        cy.createRecommendation(5)
        cy.intercept("GET", `${URL}/recommendations/top/10`).as(
            "getRecommendations"
        )
        cy.visit("http://localhost:3000/top")
        cy.wait("@getRecommendations").then(({ response }) => {
            expect(response.statusCode).equal(200)
            expect(response.body.length).equal(10)
            cy.get("#no-recommendations").should("not.exist")
            cy.get("article:nth-of-type(1)>div:nth-child(3)").then(div =>
                cy
                    .wait(500)
                    .then(() => expect(parseInt(div.text())).equal(200))
            )
            cy.get("article:nth-of-type(6)>div:nth-child(3)").then(div =>
                cy
                    .wait(500)
                    .then(() => expect(parseInt(div.text())).equal(100))
            )
        })
    })
})
