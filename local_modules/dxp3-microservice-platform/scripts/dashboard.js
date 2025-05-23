var documentReady = function() {

	var sortIndex = 1;
	var sortDirection = 'asc';
	var directions = [];
	var filterValue = '';

	function fetchServices() {
		fetch('/api/service/', {
			method: 'GET',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrer: 'no-referrer'
		})
		.then((_response) => {
			_response.json().then((_services) => {
				let tableElement = document.getElementById('services');
				let trElements = tableElement.getElementsByTagName('tr');
				for(let i=0;i < trElements.length;i++) {
					let trElement = trElements[i];
					let serviceId = trElement.id;
					// console.log('checking:' + serviceId);
					let result = _services.find(service => {
						// console.log(service.id + ' === ' + serviceId);
						let blaat = service.id === serviceId;
						// console.log(blaat);
						return blaat;
					});
					if(result === undefined || result === null) {
						// console.log('not found: ' + serviceId);
						trElement.remove();
					}
				}
				for(let i=0;i < _services.length;i++) {
					let service = _services[i];
					let trElement = document.getElementById(service.id);
					if(trElement === undefined || trElement === null) {
						let trElement = document.createElement('tr');
						trElement.id = service.id;
						let tdElement = document.createElement('td');
						tdElement.appendChild(document.createTextNode(service.id));
						trElement.appendChild(tdElement);
						tdElement = document.createElement('td');
						if(service.port != undefined && service.port != null && service.port != 0) {
							let aElement = document.createElement('a');
							if(service.settings.secure) {
								aElement.href = 'https://' + service.address + ':' + service.port;
							} else {
								aElement.href = 'http://' + service.address + ':' + service.port;
							}
							aElement.target = '_blank';
							aElement.appendChild(document.createTextNode(service.name + ':' + service.port));
							tdElement.appendChild(aElement);
						} else {
							tdElement.appendChild(document.createTextNode(service.name));
						}
						trElement.appendChild(tdElement);
						tdElement = document.createElement('td');
						tdElement.appendChild(document.createTextNode(service.type));
						trElement.appendChild(tdElement);
						tdElement = document.createElement('td');
						tdElement.appendChild(document.createTextNode(service.produces));
						trElement.appendChild(tdElement);
						tdElement = document.createElement('td');
						tdElement.appendChild(document.createTextNode(service.consumes));
						trElement.appendChild(tdElement);
						tableElement.appendChild(trElement);
					}
				}
				filter(filterValue);
		      sortColumn(sortIndex, sortDirection);
			});
		})
		.catch((_exception) => {
			alert(_exception);
		});
	}

	function filter(value) {
		let table = document.getElementById('sortMe');
		let tableBody = table.querySelector('tbody');
		let rows = tableBody.querySelectorAll('tr');
		if(value === '') {
			for(let i=0;i < rows.length;i++) {
				let row = rows[i];
	    		row.classList.remove('hide');
			}
		} else {
			for(let i=0;i < rows.length;i++) {
				let found = false;
				let row = rows[i];
		    	let columns = row.querySelectorAll('td');
		    	for(let j=0;j < columns.length;j++) {
		    		let column = columns[j];
		    		if(column.innerHTML.toLowerCase().indexOf(value) >= 0) {
		    			found = true;
		    			break;
		    		}
		    	}
		    	if(found) {
		    		row.classList.remove('hide');
		    	} else {
		    		row.classList.add('hide');
		    	}
		    }
		 }
	}

	function filterTable() {
		let input = document.getElementById('filterMe');
		let clearFilter = document.getElementById('clearFilter');
		clearFilter.addEventListener('click', (_event) => {
			input.value = '';
			input.dispatchEvent(new Event('input'));
		});
		input.addEventListener('input', (_event) => {
			filterValue = _event.target.value.toLowerCase();
			filter(filterValue);
		});
	}

	function sortTable() {
		let table = document.getElementById('sortMe');
		let headers = table.querySelectorAll('th');
		directions = Array.from(headers).map(function (header) {
		    return '';
		});
		[].forEach.call(headers, function (header, index) {
		    header.addEventListener('click', function () {
				let direction = directions[index] || 'asc';
				sortIndex = index;
				sortDirection = direction;
		      sortColumn(sortIndex, sortDirection);
			   directions[index] = direction === 'asc' ? 'desc' : 'asc';
		    });
		});
	}

	function sortColumn(index, direction) {
		let multiplier = (direction === 'asc') ? 1 : -1;
		let table = document.getElementById('sortMe');
		let tableBody = table.querySelector('tbody');
		let rows = tableBody.querySelectorAll('tr');
	    // Clone the rows
	    let newRows = Array.from(rows);

		newRows.sort(function (rowA, rowB) {
		    const cellA = rowA.querySelectorAll('td')[index].innerHTML;
		    const cellB = rowB.querySelectorAll('td')[index].innerHTML;

		    // Transform the content of cells
		    const a = transform(index, cellA);
		    const b = transform(index, cellB);

		    // And compare them
		    switch (true) {
		        case a > b:
		            return 1 * multiplier;
		        case a < b:
		            return -1 * multiplier;
		        case a === b:
		            return 0;
		    }
		});

	    // Remove old rows
	    [].forEach.call(rows, function (row) {
	        tableBody.removeChild(row);
	    });

	    // Append new row
	    newRows.forEach(function (newRow) {
	        tableBody.appendChild(newRow);
	    });
	}

	// Transform the content of given cell in given column
	function transform(index, content) {
		let table = document.getElementById('sortMe');
		let headers = table.querySelectorAll('th');
	    // Get the data type of column
	    const type = headers[index].getAttribute('data-type');
	    switch (type) {
	        case 'number':
	            return parseFloat(content);
	        case 'string':
	        default:
	            return content;
	    }
	}

	// function sortTable() {
	//   var table, rows, switching, i, x, y, shouldSwitch;
	//   table = document.getElementsByTagName('table')[0];
	//   switching = true;
	//   /* Make a loop that will continue until
	//   no switching has been done: */
	//   while (switching) {
	//     // Start by saying: no switching is done:
	//     switching = false;
	//     rows = table.rows;
	//     /* Loop through all table rows (except the
	//     first, which contains table headers): */
	//     for (i = 1; i < (rows.length - 1); i++) {
	//       // Start by saying there should be no switching:
	//       shouldSwitch = false;
	//        Get the two elements you want to compare,
	//       one from current row and one from the next: 
	//       x = rows[i].getElementsByTagName("TD")[1];
	//       y = rows[i + 1].getElementsByTagName("TD")[1];
	//       // Check if the two rows should switch place:
	//       if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
	//         // If so, mark as a switch and break the loop:
	//         shouldSwitch = true;
	//         break;
	//       }
	//     }
	//     if (shouldSwitch) {
	//       /* If a switch has been marked, make the switch
	//       and mark that a switch has been done: */
	//       rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
	//       switching = true;
	//     }
	//   }
	// }

	filterTable();
	sortTable();
	setInterval(() => { fetchServices()},5000);
}
if((document.readyState === "complete") ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) {
	documentReady();
} else {
	document.addEventListener("DOMContentLoaded", documentReady);
}
