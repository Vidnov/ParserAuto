
const fs = require('fs');
const path = require('path');

// Функция для парсинга JSON файлов в указанной папке
function parseJsonFiles(inputDir, outputDir) {
    // Читаем содержимое папки input
    fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error('Ошибка чтения папки:', err);
            return;
        }

        // Обрабатываем каждый файл в папке
        files.forEach(file => {
            const filePath = path.join(inputDir, file);
            if (path.extname(file) === '.json') {
                parseJsonFile(filePath, outputDir);
            }
        });
    });
}

// Функция для парсинга отдельного JSON файла и генерации нового формата
function parseJsonFile(inputFilePath, outputDir) {
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения файла:', err);
            return;
        }

        // Удаляем символы '\n' и '\r'
        const cleanedData = data.replace(/[\n\r]/g, '');
        let jsonData;
        try {
            jsonData = JSON.parse(cleanedData);
        } catch (e) {
            console.error('Ошибка парсинга JSON:', e.message);
            return;
        }

        // Новый массив объектов
        const resultArray = [];

        // Проверяем, есть ли данные в 'rows'
        if (jsonData.rows && Array.isArray(jsonData.rows) && jsonData.rows.length > 0) {
            jsonData.rows.forEach(item => {
                if (item.raw_data) {
                    try {
                        // Парсим строку raw_data как JSON
                        const rawData = JSON.parse(item.raw_data);

                        // Получаем значения из raw_data
                        const newObject = {
                            УНА: rawData['УНА'] || null,
                            "Отчет_Автотека": rawData.forInternalUse && rawData.forInternalUse['Отчет_Автотека'] || null
                        };
                        resultArray.push(newObject);
                    } catch (e) {
                        console.error('Ошибка парсинга raw_data:', e.message);
                    }
                }
            });
        } else {
            console.warn('Нет данных в массиве rows или массив пуст.');
        }

        // Делаем имя выходного файла на основе входного
        const outputFileName = path.basename(inputFilePath, '.json') + '_output.json';
        const outputFilePath = path.join(outputDir, outputFileName);

        // Сохраняем результат в новый файл
        fs.writeFile(outputFilePath, JSON.stringify(resultArray, null, 2), (err) => {
            if (err) {
                console.error('Ошибка записи в файл:', err);
            } else {
                console.log('Результат сохранён в', outputFilePath);
            }
        });
    });
}

// Указываем пути к входной и выходной папкам
const inputDir = path.join(__dirname, 'input');  // Папка input в корне проекта
const outputDir = path.join(__dirname, 'output'); // Папка output в корне проекта

// Убедитесь, что папка output существует
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Начинаем парсинг файлов
parseJsonFiles(inputDir, outputDir);
