const axios = require('axios');
const readline = require('readline'); //подключение модуля, который обеспечивает интерфейс для считывания данных
// из открытого для чтения потока Readable
const fs = require("fs"); //подключение модуля для различных операций с файлами

const rl = readline.createInterface({ //метод создает новый readline.Interface экземпляр
    input: process.stdin, //читаемый поток (вход) (stdin-прослушиватель данных)
    output: process.stdout // вывод на экран ввода данных пользователем, которые поступают и считываются с потока input (выход)
}); //для чтения данных в консоли построчно

//Метод rl.question() отображает query посредством записи его в output, ожидает пользовательского
// ввода данных для перенаправления в input, затем вызывает функцию callback, которая передает
// предоставленный ввод в качестве первого аргумента.
rl.question('Enter read or write ', (answer) => { //query-утверждение либо запрос для записи в output, callback-функция обратного вызова, которая вызывается с пользовательскими данными в ответ на запрос query
    if (answer === 'read') {
        const path = 'data.json';
        if (fs.existsSync(path)) { //проверка на существование файла
            let readableStream = fs.createReadStream("data.json", "utf8"); //создание потока для чтения файла
            readableStream.on("data", function (chunk) { //поток разбивается на ряд кусков(chunk).
                // и при считывании каждого такого куска, возникает событие data.
                // метод on() может подписаться на это событие и вывести каждый кусок данных на консоль
                let words = JSON.parse(chunk); //декодируем JSON-строку
                words.temperatures.map(function (el) {
                    for (let i in el) { //перебор всех свойств из объекта, i - ключ, el[i] - значение
                        if (el.hasOwnProperty(i)) { //проверяет, принадлежит ли указанное свойство самому объекту или нет
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
        rl.question('Enter city ', async (answer) => { //query-утверждение либо запрос для записи в output, callback-функция обратного вызова, которая вызывается с пользовательскими данными в ответ на запрос query
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
                let cities = {
                    temperatures: []
                };
                const path = 'data.json'
                if (fs.existsSync(path)) { //проверка на существование файла
                    fs.readFile('data.json', 'utf8', function (err, data) { //асинхронное чтение файла
                        if (err) { //если возникла ошибка, то выводим ошибку
                            console.log(err);
                        } else {
                            cities = JSON.parse(data); //теперь это объект
                            let check = cities.temperatures.some(function (el) {
                                for (let i in el) {
                                    return i === answer;
                                }
                            });
                            if (check) {
                                cities.temperatures.map((el) => {
                                    if (el[answer] !== undefined) {
                                        el[answer] = temp;
                                    }
                                    return el;
                                });
                            } else {
                                cities.temperatures.push({[answer]: temp});
                            }
                            let json = JSON.stringify(cities); //convert it back to json
                            fs.writeFile('data.json', json, function (err) { //запись файла
                                if (err) throw err; // если возникла ошибка (throw - исключение, что-то не так в коде)
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
                        fs.appendFile('data.json', JSON.stringify(newCity), (err) => { //для асинхронного добавления заданных данных в файл. если не существует, создается новый файл.
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
            rl.close(); // закрытие интерфейса
        });
    } else {
        console.log('\x1b[31m', `Enter correct action`)
    }
});


