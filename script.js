function project(){
    let flights="new_flights.csv";
    part0(flights);
}

let part0=function(filePath){
    //preprocess data
    d3.csv(filePath).then(function(data){
        part1(data);
        part2(data);
        part3(data);
        part4(data);
    });
}

let part1=function(data){
    console.log(data.slice(0, 5));
    const grouped_airline = Array.from(d3.group(data, d => d.AIRLINE), ([key, values]) => {
        return {
            airline: key,
            count: values.length,
            averageDelay: d3.sum(values, d => d.ARRIVAL_DELAY)/values.length
        };
    }).sort((a, b) => a.airline.localeCompare(b.airline, undefined, {sensitivity: 'base'}));
    console.log(grouped_airline)
      
    const svgwidth = 500;
    const svgheight = 500;

    let svg = d3.select("#plot1").append("svg")
        .attr("width", svgwidth)
        .attr("height", svgheight);
    
    let pad = 50;
    const xScale = d3.scaleLinear()
    .domain([0, d3.max(grouped_airline, d => d.count)])
        .range([pad, svgwidth-pad]);

    const yScale = d3.scaleLinear()
        .domain([Math.floor(d3.min(grouped_airline, d => d.averageDelay)), d3.max(grouped_airline, d => d.averageDelay)])
        .range([svgheight-pad, pad]);

    const xAxis = d3.axisBottom()
        .scale(xScale);
    const yAxis = d3.axisLeft()
        .scale(yScale);

    svg.append('g').call(xAxis).attr("class", "xAxis")
        .attr("transform", `translate(0, ${svgheight-pad})`)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '.5em')
        .attr('dy', '.55em')
        .attr('transform', 'rotate(-25)');
    svg.append('g').call(yAxis).attr("class", "yAxis")
        .attr("transform", `translate(${pad}, 0)`);

    svg.selectAll(".dot")
        .data(grouped_airline)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.count))
        .attr("cy", d => yScale(d.averageDelay))
        .attr("r", 4)
        .style("fill", "blue");

    svg.append("text")
        .attr("x", svgwidth / 2)
        .attr("y", svgheight - 10)
        .attr("font-size", 13)
        .style("text-anchor", "middle")
        .text("Amount of Flights");
      
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -svgheight / 2)
        .attr("y", 20)
        .attr("font-size", 13)
        .style("text-anchor", "middle")
        .text("Average Delay Time (mins)");

    svg.append("text")
        .attr("x", svgwidth / 2)
        .attr("y", 30)
        .attr("font-size", 17)
        .style("text-anchor", "middle")
        .text("Average Delay Time over Amount of Flights");
}

let part2=function(data){
    d3.csv("airlines.csv").then(function(airlines) {
        const airlines_dict = {};
        airlines.forEach(function(d) {
            airlines_dict[d.IATA_CODE] = d.AIRLINE;
        });
        const grouped_airline = Array.from(d3.group(data, d => d.AIRLINE), ([key, values]) => {
            return {
                airline: airlines_dict[key],
                prob: values.filter(d => +d.ARRIVAL_DELAY >= 30).length/values.length
            };
        }).sort((a, b) => a.airline.localeCompare(b.airline, undefined, {sensitivity: 'base'}));
        console.log(grouped_airline)
        
        const svgwidth = 500;
        const svgheight = 600;

        let svg = d3.select("#plot2").append("svg")
            .attr("width", svgwidth)
            .attr("height", svgheight);
        
        let pad = 50;
        const xScale = d3.scaleBand()
            .domain(grouped_airline.map(d => d.airline))
            .range([pad, svgwidth-pad])
            .paddingInner(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(grouped_airline, d => d.prob)])
            .range([svgheight-pad*2, pad]);

        const xAxis = d3.axisBottom()
            .scale(xScale);
        const yAxis = d3.axisLeft()
            .scale(yScale);

        svg.append('g').call(xAxis).attr("class", "xAxis")
            .attr("transform", `translate(0, ${svgheight-pad*2})`)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '.5em')
            .attr('dy', '.55em')
            .attr('transform', 'rotate(-40)');
        svg.append('g').call(yAxis).attr("class", "yAxis")
            .attr("transform", `translate(${pad}, 0)`);

        const randomColors = ["#F62C0C","#8B66C1","#2EBBD9","#F0D803",
            "#57A111","#D16B78","#405B9A","#E7A826","#59B5C6","#9E3E59",
            "#2F5D5F","#C63C14","#7F3196","#C2C3BF"];
        const colorScale = d3.scaleOrdinal()
            .domain(Object.keys(airlines_dict))
            .range(randomColors);

        const tooltip = d3.select("#tooltip");
        var mouseover = function(event,d) {
            tooltip.html(`${d.airline}<br/>Probability: ${d3.format(".3f")(d.prob)}`)
                .style("opacity", 1)
                .style("position", "absolute")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)
        };
        var mouseout = function(d) {
            tooltip.style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        };

        svg.selectAll(".bar")
            .data(grouped_airline)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("fill", d => colorScale(d.airline))
            .attr("x", d => xScale(d.airline))
            .attr("y", d => yScale(d.prob))
            .attr("height", d => svgheight-pad*2-yScale(d.prob))
            .attr("width", xScale.bandwidth())
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        svg.append("text")
            .attr("x", svgwidth / 2)
            .attr("y", svgheight - 10)
            .attr("font-size", 13)
            .style("text-anchor", "middle")
            .text("Airlines");
      
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -svgheight / 2)
            .attr("y", 10)
            .attr("font-size", 13)
            .style("text-anchor", "middle")
            .text("Probability of Severe Delays");

        svg.append("text")
            .attr("x", svgwidth / 2)
            .attr("y", 30)
            .attr("font-size", 17)
            .style("text-anchor", "middle")
            .text("Probability of Severe Delays for Each Airline");
    });
}

let part3=function(data){
    let svgwidth = 1000;
    let svgheight = 800;
    d3.csv("airports.csv").then(function(airports) {
        const airports_dict = {};
        airports.forEach(function(d) {
            airports_dict[d.IATA_CODE] = d.STATE;
        });
        const filter_data = data.filter(d => d.ORIGIN_AIRPORT.length == 3 && d.DESTINATION_AIRPORT.length == 3);
        const grouped_origin_airport = Array.from(d3.group(filter_data, d => d.ORIGIN_AIRPORT), ([key, values]) => {
            return {
                airport: key,
                prob: (values.filter(d => +d.ARRIVAL_DELAY >= 30).length/values.length)*100
            };
        }).sort((a, b) => a.airport.localeCompare(b.airport, undefined, {sensitivity: 'base'}));
        console.log(grouped_origin_airport)
        const grouped_dest_airport = Array.from(d3.group(filter_data, d => d.DESTINATION_AIRPORT), ([key, values]) => {
            return {
                airport: key,
                prob: (values.filter(d => +d.ARRIVAL_DELAY >= 30).length/values.length)*100
            };
        }).sort((a, b) => a.airport.localeCompare(b.airport, undefined, {sensitivity: 'base'}));

        const grouped_state = Array.from(d3.group(airports, d => d.STATE), ([key, values]) => {
            return {
                state: key,
                avg_prob : d3.mean(grouped_origin_airport
                    .filter(d => values.map(d => d.IATA_CODE)
                    .includes(d.airport))
                    .map(d => +d.prob).concat(grouped_dest_airport
                    .filter(d => values.map(d => d.IATA_CODE)
                    .includes(d.airport))
                    .map(d => +d.prob)))
            };
        }).sort((a, b) => a.state.localeCompare(b.state, undefined, {sensitivity: 'base'}));
        console.log(grouped_state);

        const svg = d3.select("#plot3")
        .append("svg")
        .attr("width", svgwidth)
        .attr("height", svgheight);

        const projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([svgwidth/2, svgheight/2]);
        const pathgeo = d3.geoPath().projection(projection);
        const max_prob = Math.ceil(Math.log(d3.max(grouped_state, d => d.avg_prob)))*10;
        console.log(max_prob)

        const colorScale = d3.scaleSequential()
            .domain([0, max_prob])
            .interpolator(d3.interpolateBlues);
        const map = d3.json("./us-states.json");
        const tooltip = d3.select("#tooltip");
        map.then(map => {
            svg.append("g").selectAll("path")
                .data(map.features)
                .enter()
                .append("path")
                .attr("d", pathgeo)
                .style("fill", d => {
                    let state_abbrev = d.properties.name;
                    let state_prob = (grouped_state.find(d => d.state == state_abbrev)?.avg_prob || 0);
                    return colorScale(Math.log(state_prob)*10);
                })
                .on("mouseover", function (event, d) {
                    let state_abbrev = d.properties.name;
                    let state_prob = (grouped_state.find(d => d.state == state_abbrev)?.avg_prob || 0);
                    tooltip.html(`${state_abbrev}<br/>Probability: ${d3.format(".3f")(state_prob)}%`)
                        .style("opacity", 1)
                        .style("position", "absolute")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");})

                .on("mouseout", function() {
                    tooltip.style("opacity", 0);})
        });
        svg.append("text")
            .attr("x", svgwidth / 2)
            .attr("y", 30)
            .attr("font-size", 17)
            .style("text-anchor", "middle")
            .text("US Map for Average Probabiliity of Severe Delay");

        /*
        const grouped_flights = Array.from(d3.group(filter_data, d => `${d.ORIGIN_AIRPORT}-${d.DESTINATION_AIRPORT}`), ([key, values]) => {
            if (values.length >= 52) {//remove unpopular path
                return {
                    path: key,
                    avg_prob: (values.map(d => +d.ARRIVAL_DELAY).filter(d => d >= 30).length / values.length) * 100
                };
            }
        }).filter(d => d);
        console.log(grouped_flights)
        grouped_flights.sort((a, b) => b.avg_prob - a.avg_prob);
        const top_paths = grouped_flights.slice(0, 5);
        const lowest_paths = grouped_flights.slice(-5);
        console.log(top_paths)
        console.log(lowest_paths)
            
        const route = [{x: , y: },{x:, y:}, {x: ,y: }, {x:, y: }]
                
        const routeProjected = [];
                
        for (i in route){
            routeProjected.push(projection([route[i].x, route[i].y]));
        }
                
        const lineGenerator = d3.line();
        const routeData = lineGenerator(routeProjected);

        // Define the path for the points in routeData
        let path = svg.append("path")
            .attr("class", "route")
            .attr("d", routeData)
            .attr("fill", "none")
            .attr("stroke", "red");
        */
    });
}

/*
.style("fill", d => {
                    let state_abbrev = d.properties.name;
                    let airport_prob = (grouped_dest_airport.find(d => airports_dict[d.airport] == state_abbrev)?.prob || 0)
                        +(grouped_origin_airport.find(d => airports_dict[d.airport] == state_abbrev)?.prob || 0);
                    return colorScale(airport_prob);
                });
*/
let part4=function(data){
    const filter_data = data.filter(d => d.ORIGIN_AIRPORT.length == 3 && d.DESTINATION_AIRPORT.length == 3);
    const grouped_flights = Array.from(d3.group(filter_data, d => `${d.ORIGIN_AIRPORT}-${d.DESTINATION_AIRPORT}`), ([key, values]) => {
        if (values.length >= 52) {//remove unpopular path
            return {
                path: key,
                avg_prob: (values.map(d => +d.ARRIVAL_DELAY).filter(d => d >= 30).length / values.length) * 100
            };
        }
    }).filter(d => d);
    console.log(grouped_flights)
    grouped_flights.sort((a, b) => b.avg_prob - a.avg_prob);
    const top_paths = grouped_flights.slice(0, 10);
    const lowest_paths = grouped_flights.slice(-10);
    console.log(top_paths)
    console.log(lowest_paths)

    let links = lowest_paths.map(({path, avg_prob}) => {
        const [originAirport, destinationAirport] = path.split('-');
        return {
            source: originAirport,
            target: destinationAirport,
            value: avg_prob
        };
    });   

    const svgwidth = 500;
    const svgheight = 500;
    
    const svg = d3.select("#plot4")
        .append("svg")
        .attr("width", svgwidth)
        .attr("height", svgheight);

    svg.append("text")
        .attr("x", svgwidth / 2)
        .attr("y", 30)
        .attr("font-size", 14)
        .style("text-anchor", "middle")
        .text("Top 10 Routes with Highest/Lowest Probability of Severe Delays");

    let link, node, label;

    const render = () => {

    svg.selectAll(".link").remove();
    svg.selectAll(".node").remove();
    svg.selectAll(".label").remove();
        
    console.log("links:") 
    console.log(links);

    const sources = links.map(({source}) => source);
    const targets = links.map(({target}) => target);
    const all_airports = [...new Set([...sources, ...targets])].map(airport => ({airport}));
    
    console.log('all_airports:');
    console.log(all_airports);

    const link_scale = d3.scaleLinear()
        .domain([0, d3.max(links, d => d.value)])
        .range([1, 10]);

    link = svg.selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .style("stroke", "steelblue")
        .style("stroke-width", d => link_scale(d.value));
    
    node = svg.selectAll(".node")
        .data(all_airports)
        .enter()
        .append("g")
        .append("circle")
        .attr("class", "node")
        .attr("r", 6)
        .style("fill", "orange");
        
    label = svg.selectAll(".label")
        .data(all_airports)
        .enter()
        .append("g")
        .append("text")
        .attr("class", "label")
        .text(d=>d.airport)
        .attr("text-anchor", "start")
        .attr("font-size",8);
    
    const simulation = d3.forceSimulation(all_airports)
        .force("link", d3.forceLink(links).id(d => d.airport))
        .force("charge", d3.forceManyBody().strength(-15))
        .force("center", d3.forceCenter(svgwidth / 2, svgheight / 2));
    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
        label.attr("x", d => d.x)
            .attr("y", d => d.y);
    });
    let zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', function(event) {
            svg.selectAll("g")
                .attr('transform', event.transform);
            svg.selectAll("line")
                .attr('transform', event.transform);
        });
    svg.call(zoom)
    }
    const lowest = () => {
        d3.select("#lowest").on('click', function(d,i) {
            links = lowest_paths.map(({path, avg_prob}) => {
            const [originAirport, destinationAirport] = path.split('-');
            return {
                source: originAirport,
                target: destinationAirport,
                value: avg_prob
            };
            });   
            render()
        });
    };

    const highest = () => {
        d3.select("#highest").on('click', function(d,i) {
            links = top_paths.map(({path, avg_prob}) => {
            const [originAirport, destinationAirport] = path.split('-');
            return {
                source: originAirport,
                target: destinationAirport,
                value: avg_prob
            };
            });   
            render();
        });
    };
    render();
    lowest();
    highest();
}
      

