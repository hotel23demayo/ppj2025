<script>
        // Variable global para almacenar los datos relevantes del archivo CSV
        var relevantData = [];
    
        // Función que maneja la selección de un archivo CSV
        function handleFileSelect() {
            // Crear un elemento input tipo "file" para seleccionar el archivo CSV
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.csv';
            fileInput.addEventListener('change', (event) => {
                // Cuando se selecciona un archivo, leer su contenido
                const file = event.target.files[0];
                const reader = new FileReader();
    
                reader.onload = () => {
                    // Procesar el contenido del archivo CSV y almacenar los datos relevantes
                    const fileContents = reader.result;
                    relevantData = processData(fileContents);
    
                    // Actualizar la salida en la página según los datos relevantes obtenidos
                    const resultOutput = document.getElementById('resultOutput');
                    const noDataMessage = document.getElementById('noDataMessage');
    
                    if (relevantData.length === 0) {
                        resultOutput.innerHTML = ''; // Limpiar cualquier contenido existente
                        noDataMessage.style.display = 'block'; // Mostrar mensaje si no hay datos relevantes
                    } else {
                        resultOutput.innerHTML = relevantDataToForm(relevantData);
                        noDataMessage.style.display = 'none';
                    }
                };
    
                // Leer el archivo como texto
                reader.readAsText(file);
            });
    
            // Hacer clic en el elemento input oculto para abrir el diálogo de selección de archivo
            fileInput.click();
        }
    
        // Función para procesar el contenido del archivo CSV y extraer los datos relevantes
function processData(fileContents) {
    var lines = fileContents.split('\n');
    relevantData = [];

    for (var i = 1; i < lines.length; i++) {
        var line = lines[i].trim();

        if (line !== '') {
            var fields = line.split(',');

            var passengerName = fields[13];
            var dni = fields[12];
            var hotel = fields[1];
            var dinRaw = fields[8];
            var doutRaw = fields[9];
            var din = formatDate(dinRaw);
            var dout = formatDate(doutRaw);

            var roomNumber = fields[2].replace(/[^\d]/g, '');
            var voucher = fields[6];
            var tipo = fields[3]; // Añadido para identificar el tipo de habitación

            var cantp = 1; // Por defecto, cada persona tiene su propio voucher

            if (tipo.includes('DBL MAT')) {
                cantp = 2; // Si es matrimonio (DBL MAT), cantp es 2
            } else if (tipo.includes('DBL IND')) {
                cantp = 1; // Si es individual (DBL IND), cantp es 1
            }

            var stayDuration = calculateStayDuration(dinRaw, doutRaw);

            var relevantFields = {
                passengerName,
                dni,
                hotel,
                din,
                dout,
                dinRaw,
                doutRaw,
                roomNumber,
                cantp,
                stayDuration,
                voucher,
                cenaCount: 2 * cantp * stayDuration,
            };

            relevantData.push(relevantFields);
        }
    }

    return relevantData;
}
        function isPassengerAccompanied(roomNumber, voucher, tipo) {
    var count = 0;
    for (var i = 0; i < relevantData.length; i++) {
        var item = relevantData[i];

        if (item.roomNumber === roomNumber && item.voucher === voucher) {
            if (tipo === 'DBL MAT') {
                // Si el tipo de habitación es 'DBL MAT', considerarlos como pareja
                count += 2;
            } else if (tipo === 'DBL IND') {
                // Si el tipo de habitación es 'DBL IND', contarlos individualmente
                count++;
            }
        }

        if (count >= 2) {
            return true;
        }
    }

    return false;
}
    
        // Función para formatear una fecha en formato "dd/mm/yyyy" a "yyyy/mm/dd"
        function formatDate(dateString) {
            var parts = dateString.split('/');
            var formattedDate = parts[2] + '/' + parts[1] + '/' + parts[0];
            return formattedDate;
        }
    
        // Función para calcular la duración de la estancia en días
        function calculateStayDuration(dinRaw, doutRaw) {
            var dinDate = new Date(formatDate(dinRaw));
            var doutDate = new Date(formatDate(doutRaw));
            var millisecondsPerDay = 24 * 60 * 60 * 1000;
            var duration = Math.round((doutDate - dinDate) / millisecondsPerDay);
    
            return duration;
        }
    
        // Función para convertir los datos relevantes a una forma HTML
function relevantDataToForm(relevantData) {
    var formHTML = '';
    var groupedData = groupDataByRoomAndVoucher(relevantData);

    for (var key in groupedData) {
        var group = groupedData[key];
        var item = group[0]; // Tomamos solo la información de una persona

        formHTML += '<div class="container">';
        formHTML += '<div class="logo-container"><img src="suteba_logo_3.jpg" alt="Logo"></div>';
        formHTML += '<h1 class="h1-container">Voucher de Comidas PPJ</h1>';
        formHTML += '<p class="p-cena">Favor de brindar servicio de Pension Completa al siguiente afiliado:</p>';
        formHTML += '<div class="passengerName"><strong>Nombre:</strong> ' + item.passengerName + '</div>';
        formHTML += '<div class="dni"><strong>Dni:</strong> ' + item.dni + '</div>';
        formHTML += '<div class="hotel"><strong>U.Turistica</strong> ' + item.hotel + '</div>';
        formHTML += '<div class="din"><strong>Ingreso:</strong> ' + item.dinRaw + '</div>';
        formHTML += '<div class="dout"><strong>Egreso:</strong> ' + item.doutRaw + '</div>';
        formHTML += '<div class="roomNumber"><strong>Habitacion Nº:</strong> <span class="roomNumberContent">' + item.roomNumber + '</span></div>';
        formHTML += '<div class="cantp"><strong>Cant. Pax:</strong> ' + item.cantp + '</div>';
        formHTML += '<p class="p-servicios"><strong>Servicios a Tomar</strong></p>';
        formHTML += '<div class="cantMap"><strong>Cant. Comidas:</strong> ' + item.cenaCount + '</div>';
        formHTML += '<div class="check-container"><img src="JubPc2.png" alt="Logo"></div>';
        formHTML += '</div>';

        if (item.cenaCount === 12) {
            // Si cenaCount es 12, no necesitamos generar más vouchers para esta habitación
        }
    }

    return formHTML;
}



function groupDataByRoomAndVoucher(relevantData) {
    var groupedData = {};

    for (var i = 0; i < relevantData.length; i++) {
        var item = relevantData[i];
        var key = item.roomNumber + item.voucher;

        if (!groupedData[key]) {
            groupedData[key] = [];
        }

        groupedData[key].push(item);
    }

    return groupedData;
}
    
        // Función para guardar los datos relevantes como archivo CSV
        function saveAsCSV() {
            if (relevantData.length === 0) {
                const resultOutput = document.getElementById('resultOutput');
                resultOutput.textContent = "No hay media pensión contratada";
                return;
            }
    
            var csv = relevantDataToCSV(relevantData);
            downloadCSV(csv, 'voucher.csv');
        }
    
        // Función para convertir los datos relevantes a formato CSV
        function relevantDataToCSV(relevantData) {
            var csv = 'Nombre Pasajero,Numero Dni,Fecha de Ingreso,Fecha de Egreso,Numero de Habitacion,Cantidad de Personas,Duracion de Estadia\n';
    
            for (var i = 0; i < relevantData.length; i++) {
                var item = relevantData[i];
                csv += item.passengerName + ',' + item.dni + ',' + item.dinRaw + ',' + item.doutRaw + ',' + item.roomNumber + ',' + item.cantp + ',' + item.stayDuration + '\n';
            }
    
            return csv;
        }
    
        // Función para imprimir el contenido relevante
        function printContent() {
            var headerContainer = document.querySelector('.header-container');
            headerContainer.style.display = 'none';
            window.print();
            headerContainer.style.display = 'block';
        }
    
        
    </script>
