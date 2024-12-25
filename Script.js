document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    // Validate username
    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = 'https://api.allorigins.win/get?url='; // Use an alternative proxy
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                                totalSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                            }
                        }
                    }
                `,
                variables: { username: `${username}` }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details");
            }

            const parsedData = await response.json();
            console.log("Logging data: ", parsedData);

            displayUserData(parsedData);
        } catch (error) {
            console.error("Error fetching user details:", error);
            if (statsContainer) {
                statsContainer.innerHTML = `<p>${error.message}</p>`;
            }
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        if (!parsedData.data || !parsedData.data.matchedUser) {
            if (statsContainer) {
                statsContainer.innerHTML = `<p>No data available for the user</p>`;
            }
            return;
        }

        const allQuestionsCount = parsedData.data.allQuestionsCount || [];
        const submitStats = parsedData.data.matchedUser.submitStats || {};

        const totalEasyQues = allQuestionsCount[1]?.count || 0;
        const totalMediumQues = allQuestionsCount[2]?.count || 0;
        const totalHardQues = allQuestionsCount[3]?.count || 0;

        const solvedTotalEasyQues = submitStats.acSubmissionNum?.[1]?.count || 0;
        const solvedTotalMediumQues = submitStats.acSubmissionNum?.[2]?.count || 0;
        const solvedTotalHardQues = submitStats.acSubmissionNum?.[3]?.count || 0;

        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Overall Submissions", value: submitStats.totalSubmissionNum?.[0]?.submissions || 0 },
            { label: "Overall Easy Submissions", value: submitStats.totalSubmissionNum?.[1]?.submissions || 0 },
            { label: "Overall Medium Submissions", value: submitStats.totalSubmissionNum?.[2]?.submissions || 0 },
            { label: "Overall Hard Submissions", value: submitStats.totalSubmissionNum?.[3]?.submissions || 0 },
        ];

        console.log("Card data:", cardsData);

        if (cardStatsContainer) {
            cardStatsContainer.innerHTML = cardsData.map(
                data =>
                    `<div class="card">
                        <h4>${data.label}</h4>
                        <p>${data.value}</p>
                    </div>`
            ).join("");
        }
    }

    searchButton.addEventListener("click", function () {
        const username = usernameInput.value;
        console.log("Logging username: ", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
