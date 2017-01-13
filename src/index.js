/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Implements basic mock for the fetch interface use `whatwg-fetch` polyfill.
 *
 * See https://fetch.spec.whatwg.org/
 */

require('whatwg-fetch');

const ActualResponse = Response;

function ResponseWrapper(body, init, status) {
  if (
    typeof body.constructor === 'function' &&
    body.constructor.__isFallback
  ) {
    const response = new ActualResponse(null, init);
    response.body = body;

    const actualClone = response.clone;
    response.clone = () => {
      const clone = actualClone.call(response);
      const [body1, body2] = body.tee();
      response.body = body1;
      clone.body = body2;
      return clone;
    };

    return response;
  }

  let item = new ActualResponse(body, init);
  item.ok = status;
  return item;
}

const fetch = jest.fn();
fetch.Headers = Headers;
fetch.Response = ResponseWrapper;
fetch.Request = Request;
fetch.mockResponse = (body, init, status) => {
  fetch.mockImplementation(
    () => Promise.resolve(new ResponseWrapper(body, init, status))
  );
};

fetch.mockResponseOnce = (body, init, status) => {
  fetch.mockImplementationOnce(
    () => Promise.resolve(new ResponseWrapper(body, init, status))
  );
};

fetch.mockResponses = (...responses) => {
  responses.forEach(([ body, init, status ]) => {
    fetch.mockImplementationOnce(
      () => Promise.resolve(new ResponseWrapper(body, init, status))
    );
  })
};

// Default mock is just a empty string.
fetch.mockResponse('');

module.exports = fetch;
