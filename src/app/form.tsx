'use client'

import { useState } from "react";

function Form() {
    const [apiUrl, setApiUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [numberOfRequests, setNumberOfRequests] = useState<number>(0);
    const [maxConcurrent, setMaxConcurrent] = useState<number>(5);
    const [body, setBody] = useState<string>('');

    const [headers, setHeaders] = useState<{}>({
        'Content-Type': 'application/json'
    });
    const [requestType, setRequestType] = useState<string>('GET');
    const [endpointsResponse, setEndpointsResponse] = useState<
        { url?: string, status?: number }[]
    >([
    ])

    const clear = () => {
        // setApiUrl('');
        // setNumberOfRequests(0);
        // setBody('');
        // setHeaders({
        //     'Content-Type': 'application/json'
        // });
        // setRequestType('GET');
        setEndpointsResponse([]);
    }

    const fetchWithConcurrencyLimit = async () => {
        let _endpointsResponse = [...endpointsResponse];
        setLoading(true);
        console.log('Number of requests', numberOfRequests);

        const requests = [];
        let activeRequests = 0;
        let index = 0;

        const makeRequest = async () => {
            while (index < numberOfRequests) {
                if (activeRequests >= maxConcurrent) {
                    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for a short period
                    continue;
                }

                activeRequests++;
                const currentIndex = index++;

                let _headers = { ...headers, 'randInt': (Math.random() * 10).toString() };

                fetch(apiUrl, {
                    method: requestType,
                    headers: _headers,
                    body: body
                })
                    .then(async res => {
                        _endpointsResponse.push({ url: apiUrl, status: res.status });
                        const data = await res.text();
                    })
                    .catch(err => {
                        console.error(`Request ${currentIndex} failed`, err);
                    })
                    .finally(() => {
                        activeRequests--;
                    });
            }
        };

        await Promise.all([...Array(maxConcurrent)].map(makeRequest));

        setEndpointsResponse(_endpointsResponse);
        setLoading(false);
    };

    const startParallelTest = async () => {
        let _endpointsResponse = [...endpointsResponse];
        setLoading(true);
        console.log('Number of requests', numberOfRequests);
        let requests = [];
        for (let i = 0; i < numberOfRequests; i++) {
            requests.push(fetch(
                apiUrl,
                {
                    method: requestType,
                    headers: headers,
                    body: body
                }
            ).then(async (res) => {
                _endpointsResponse.push({ url: apiUrl, status: res.status });
                const data = await res.text();
            }));
        }
        await Promise.all(requests);
        setEndpointsResponse(_endpointsResponse);
        setLoading(false);
    }

    const startTest = async () => {
        let _endpointsResponse = [...endpointsResponse];
        setLoading(true);
        console.log('Number of requests', numberOfRequests);

        for (let i = 0; i < numberOfRequests; i++) {
            await fetch(
                apiUrl,
                {
                    method: requestType,
                    headers: headers,
                    body: body
                }
            ).then(async (res) => {
                _endpointsResponse.push({ url: apiUrl, status: res.status });
                const data = await res.text();
            });
        }
        setEndpointsResponse(_endpointsResponse);
        setLoading(false);
    }

    const getStatusColor = (status: number) => {
        let colorsStatus = {
            200: "text-green-400",
            201: "text-green-400",
            404: "text-yellow-300",
            500: "text-red-400",
        }
        // @ts-ignore
        return colorsStatus[status] || "text-yellow-300";
    }

    const _setRequestType = (e: any) => {
        setRequestType(e.target.innerText);
    }

    const changeHeaders = (e: any, header: any, i: any) => {
        let _headers = { ...headers };
        // @ts-ignore
        _headers[e.target.value] = headers[header];
        // @ts-ignore
        delete _headers[header];
        setHeaders(_headers);
    }

    return (
        <div className="flex flex-col gap-2">
            {loading && <p>Loading...</p>}
            <input onChange={(e) => setApiUrl(
                e.target.value
            )} type="text" placeholder="API URL" className="bg-zinc-900 w-full p-2 border rounded-md" />
            <input type="number" placeholder="Number of requests" className="bg-zinc-900 p-2 border rounded-md w-full min-w-full" onChange={(e) => setNumberOfRequests(parseInt(e.target.value))} />
            <input type="number" placeholder="Max concurrent requests" className="bg-zinc-900 p-2 border rounded-md w-full min-w-full" onChange={(e) => setMaxConcurrent(parseInt(e.target.value))} />
            <div className="flex flex-row gap-2 text-xs font-extrabold">
                <button className={"p-2 rounded-md " + (requestType === 'GET' ? "bg-indigo-600" : "")} onClick={_setRequestType}>GET</button>
                <button className={"p-2 rounded-md " + (requestType === 'POST' ? "bg-indigo-600" : "")} onClick={_setRequestType}>POST</button>
                <button className={"p-2 rounded-md " + (requestType === 'PUT' ? "bg-indigo-600" : "")} onClick={_setRequestType}>PUT</button>
                <button className={"p-2 rounded-md " + (requestType === 'DELETE' ? "bg-indigo-600" : "")} onClick={_setRequestType}>DELETE</button>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Headers</h3>
                <button onClick={(
                    e: any
                ) => setHeaders({ ...headers, '': '' }
                )}>+</button>
                {Object.keys(headers).map((header, i) => (
                    <div className="flex gap-4 ">
                        <div className="border rounded-md">
                            <input type="text" placeholder="Header key" className="bg-zinc-900 p-2 rounded-t-md w-full" value={header}
                                onChange={(e) => changeHeaders(e, header, i)
                                }
                            />
                            {/* @ts-ignore */}
                            <input type="text" placeholder="Header value" className="bg-zinc-900 p-2 rounded-b-md w-full" value={headers[header]}
                                onChange={(e) => {
                                    let _headers = { ...headers };
                                    // @ts-ignore
                                    _headers[header] = e.target.value;
                                    setHeaders(_headers);
                                }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                let _headers = { ...headers };
                                // @ts-ignore
                                delete _headers[header];
                                setHeaders(_headers);
                            }}
                        >X</button>
                    </div>
                ))}

            </div>
            <h3 className="text-xl font-bold">
                Body
            </h3>
            <textarea placeholder="Request body (by default is empty)" className="bg-zinc-900 w-full p-2 border rounded-md font-semibold text-pretty"
                onChange={(e) => setBody(e.target.value)}
            />
            <button onClick={startTest} className="p-2 border rounded-md shadow-md w-full">Start</button>
            <button onClick={fetchWithConcurrencyLimit} className="p-2 border rounded-md shadow-md w-full">Start Parallel</button>
            <button onClick={clear} className="p-2 border rounded-md shadow-md w-full">Clear</button>
            {
                !loading && endpointsResponse.length > 0 && (
                    <>
                        <h3 className="text-xl font-bold">Response of endpoints</h3>

                        <div className="rounded-md shadow-md shadow-zinc-800 flex flex-col gap-2 p-2 bg-zinc-900 w-full">
                            {endpointsResponse.map((endpoint, i) => (
                                <div className="flex flex-row gap-2 ">
                                    <p key={i} className="truncate">{endpoint.url}</p>
                                    <span className={
                                        getStatusColor(endpoint.status || 0)
                                    }>{endpoint.status}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )
            }
        </div >
    )
}

export default Form