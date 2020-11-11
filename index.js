const axios = require('axios');
const readline = require('readline');
const fs = require("fs");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter read or write ', (answer) => {
    if (answer === 'read') {
        const path = 'data.json'
        if (fs.existsSync(path)) {
            let readableStream = fs.createReadStream("data.json", "utf8");
            readableStream.on("data", function (chunk) {
                let words = JSON.parse(chunk);
                words.temperatures.map(function (el) {
                    for (let i in el) {
                        if (el.hasOwnProperty(i)) {
                            if (el[i] > 20) {
                                console.log('\x1b[31m', i + ': ' + el[i]);
                            } else if (el[i] > 10) {
                                console.log('\x1b[33m', i + ': ' + el[i]);
                            } else {
                                console.log('\x1b[34m', i + ': ' + el[i]);
                            }
                        }
                    }
                });
            });
        } else {
            console.log('\x1b[31m', `No data available`)
        }
    } else if (answer === 'write') {
        rl.question('Enter city ', async (answer) => {
            try {
                let {data} = await axios.get('http://api.openweathermap.org/data/2.5/weather', {
                    params: {
                        q: answer,
                        appid: 'ff0b740ef54b37cb4b88cadacb59d187',
                        units: 'metric'
                    }
                });
                const key = data.main;
                const temp = key.temp;
                let city = {
                    temperatures: []
                };
                const path = 'data.json'
                if (fs.existsSync(path)) {
                    fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            city = JSON.parse(data); //now it an object
                            city.temperatures.push({[answer]: temp}); //add some data
                            let json = JSON.stringify(city); //convert it back to json
                            fs.writeFile('data.json', json, function (err) {
                                if (err) throw err;
                            }); // write it back
                        }
                    });
                } else {
                    const newCity = {
                        temperatures: [
                            {[answer]: temp}
                        ]
                    }
                    function fileHandler() {
                        fs.appendFile('data.json', JSON.stringify(newCity), (err) => {
                            if (err) throw err;
                        });
                    }
                    fileHandler();
                }
                if (temp > 20) {
                    console.log('\x1b[31m', `City temperature ${temp}`);
                } else if (temp > 10) {
                    console.log('\x1b[33m', `City temperature ${temp}`);
                } else {
                    console.log('\x1b[34m', `City temperature ${temp}`);
                }
            } catch (e) {
                console.log('\x1b[31m', `Enter the correct city`);
            }
            rl.close();
        });
    } else {
        console.log('\x1b[31m', `Enter correct action`)
    }
});


