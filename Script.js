document.addEventListener("DOMContentLoaded", function () {
    const SearchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-card"); // Use stats-card as in HTML
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");

    // Return true or false based on regex
    function validateusername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) alert("Invalid Username");
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            SearchButton.textContent = "Searching...";
            SearchButton.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Proxy URL for CORS
            const targetUrl = 'https://leetcode.com/graphql/';
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

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
                variables: { "username": username }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details");
            }
            const data = await response.json();
            console.log("Fetched data:", data);

            if (data.errors) {
                throw new Error("Error from GraphQL API: " + data.errors[0].message);
            }

            displayUserData(data);
        } catch (error) {
            console.error("Error:", error);
            statsContainer.innerHTML = `<p>No data found. Please check the username and try again.</p>`;
        } finally {
            SearchButton.textContent = "Search";
            SearchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);  // Fix setProperty
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(data) {
        const totalQues = data.data.allQuestionsCount[0].count;
        const totalEasyQues = data.data.allQuestionsCount[1].count;
        const totalMediumQues = data.data.allQuestionsCount[2].count;
        const totalHardQues = data.data.allQuestionsCount[3].count;

        const solvedTotalQues = data.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = data.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = data.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = data.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        // Populate Stats Card
        statsContainer.innerHTML = `
            <h2>Statistics for ${usernameInput.value}</h2>
            <p>Total Questions: ${totalQues}</p>
            <p>Solved Questions: ${solvedTotalQues}</p>
            <p>Easy Solved: ${solvedTotalEasyQues} / ${totalEasyQues}</p>
            <p>Medium Solved: ${solvedTotalMediumQues} / ${totalMediumQues}</p>
            <p>Hard Solved: ${solvedTotalHardQues} / ${totalHardQues}</p>
        `;
    }

    SearchButton.addEventListener('click', function () {
        const username = usernameInput.value;
        console.log("Login username:", username);
        if (validateusername(username)) {
            fetchUserDetails(username);
        }
    });
});
