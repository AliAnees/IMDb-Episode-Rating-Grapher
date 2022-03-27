const input = document.getElementById("search-input");
const searchBtn = document.querySelector('#search-btn');
const table = document.getElementById('table');
var myChart = null;

document.addEventListener('DOMContentLoaded', function () {
    table.style.display = "none";
});

input.addEventListener("keyup", function(event) {
    const searchInput = document.querySelector('#search-input').value;
    if(searchInput.length > 2) {
        table.style.display = "inline-block";
        fetch('http://localhost:5000/search/' + searchInput)
        .then(response => response.json())
        .then(data => {
            if (event.key === "Enter") {
                input.value = "";
                loadHTMLTable([]);
                showTitle = data['data'][0].showTitle;
                showID = data['data'][0].showID;
                
                fetch('http://localhost:5000/show/' + showID)
                .then(response => response.json())
                .then(showData => graph(showTitle, showData['data']));
            } else {
                loadHTMLTable(data['data'])
            }
        });
    } else {
        table.style.display = "none";
        loadHTMLTable([])
    }
});

function loadHTMLTable(data) {
    const tableTBody = document.querySelector('table tbody');

    if (data.length === 0) {
        tableTBody.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>"
    }

    let tableHtml = "";

    data.forEach(function ({showTitle, startYear, genres, rating, votes}) {
        tableHtml += "<tr>";
        tableHtml += `<td>${showTitle}</td>`;
        tableHtml += `<td>${startYear}</td>`;
        tableHtml += `<td>${genres}</td>`;
        tableHtml += `<td>${rating}</td>`;
        tableHtml += `<td>${votes}</td>`;
        tableHtml += "</tr>";
    });

    tableTBody.innerHTML = tableHtml;
}

function graph(showTitle, showData){
    table.style.display = "none";
    var count = 0;
    var totalEpisodes = [];
    var ratings = [];

    showData.forEach(function ({rating}) {
        totalEpisodes.push(count += 1)
        ratings.push(rating);
    });

    if(myChart!=null){
        myChart.destroy();
    }

    require(['node_modules/chart.js/dist/chart.min.js'], function(Chart){
        var ctx = document.getElementById('myChart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: totalEpisodes,
                datasets: [{
                    label: 'ratings',
                    data: ratings,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    tension: 0.3
                }]
            },
            options: {
                scales: {
                    y: {
                        min: Math.floor(Math.min.apply(Math, ratings) - 1),
                        max: 10
                    },
                    x: {
                        ticks: {
                            fixedStepSize: 5,
                            maxTicksLimit: 25
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: showTitle,
                        font: {
                            size: 30
                        }
                    },
                    legend: {
                        display: false,
                    },
                    id: 'custom_canvas_background_color',
                    beforeDraw: (chart) => {
                        const ctx = chart.canvas.getContext('2d');
                        ctx.save();
                        ctx.globalCompositeOperation = 'destination-over';
                        ctx.fillStyle = 'lightGreen';
                        ctx.fillRect(0, 0, chart.width, chart.height);
                        ctx.restore();
                    }
                }
            }
        });
    });
}