# Flower API Testing Framework

This testing framework is designed to facilitate automated testing of RESTful APIs through configurable YAML files. It supports making HTTP requests, asserting response data, and dynamically managing test data.

## Features

- Allows assertions on response status codes, headers, and body content.
- Supports dynamic data through context, allowing data from one response to be used in subsequent requests.
- Configurable through YAML files for easy test management and readability.


## TODOs

You tell me, please

## Getting Started

To get started with this testing framework, clone the repository and install the necessary dependencies:

```bash
git clone git@github.com:jersobh/flower.git
cd flower
npm install
```

Check out the `test_server` directory and the `test-example.yaml` for a complete flow example.


## Writing Test Configurations

Test configurations are defined in YAML files. Here's an example configuration for testing post creation and retrieval:

```yaml
testPostLifecycle:
  - name: "Create a New Post"
    url: "https://jsonplaceholder.typicode.com/posts"
    method: "POST"
    params:
      title: 'foo'
      body: 'bar'
      userId: 1
    assertions:
      - type: "equal"
        target: "status"
        expected: 201
      - type: "equal"
        target: "data.title"
        expected: "foo"
    saveToContext:
      postId: "data.id"
```


## Running Tests

To run your tests, execute the test runner from the command line:

```bash
npm run test
```

or, to run all tests in parallel:

```bash
npm run test-parallel
```


## Test Configuration Options

- name: A descriptive name for the test step.
- url: The URL for the HTTP request.
- method: The HTTP method (e.g., GET, POST).
- params: Parameters to be sent with the request. For GET requests, these are query parameters. For POST requests, this is the request body.
- assertions: A list of conditions to assert on the response.
- saveToContext: Specifies response data to save to the context for use in later test steps.


## Assertions

The framework supports several assertion types:

- `equal`: Asserts that the target value is equal to the expected value.
- `include`: Asserts that the target string or array includes the expected value.
- `greaterThan`, lessThan: Asserts numerical comparisons.
- `deepEqual`: Asserts deep equality of objects or arrays.
- `notEqual`, `isNull`, `isNotNull`, `isTrue`, `isFalse`: Assert specific conditions.


## Contributing

Contributions to this testing framework are welcome. Please submit a pull request or create an issue for any features, fixes, or improvements.

