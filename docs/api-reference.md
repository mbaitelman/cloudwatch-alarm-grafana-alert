# API Reference

This document provides complete API documentation for the CloudWatch to Grafana Alert Translator.

## AlertTranslator Class

The main class that handles the translation of CloudWatch alarms to Grafana alert rules.

### Constructor

```javascript
const translator = new AlertTranslator();
```

Creates a new instance of the AlertTranslator class.

### Methods

#### `translateToGrafanaAlert(cloudWatchAlarm)`

Translates a CloudWatch alarm configuration to a Grafana alert rule.

**Parameters:**
- `cloudWatchAlarm` (Object): CloudWatch alarm configuration object

**Returns:**
- `Object`: Grafana alert rule in YAML-compatible format

**Throws:**
- `Error`: If validation fails or translation encounters an error

**Example:**
```javascript
const alarm = {
  alarmName: 'HighCPUUtilization',
  metricName: 'CPUUtilization',
  namespace: 'AWS/EC2',
  statistic: 'Average',
  period: 300,
  threshold: 80.0,
  comparisonOperator: 'GreaterThanThreshold',
  evaluationPeriods: 2,
  datapointsToAlarm: 2,
  dimensions: [
    { Name: 'InstanceId', Value: 'i-1234567890abcdef0' }
  ]
};

const result = translator.translateToGrafanaAlert(alarm);
console.log(result);
```

**Output:**
```javascript
{
  groups: [{
    name: 'cloudwatch-alerts',
    rules: [{
      alert: 'HighCPUUtilization',
      expr: 'avg_over_time(aws_ec2_cpu_utilization_percent{InstanceId="i-1234567890abcdef0"})',
      for: '10m',
      labels: {
        severity: 'warning',
        source: 'cloudwatch',
        namespace: 'AWS/EC2',
        metric: 'CPUUtilization',
        instanceid: 'i-1234567890abcdef0'
      },
      annotations: {
        summary: 'HighCPUUtilization alert',
        description: 'CloudWatch alarm HighCPUUtilization for CPUUtilization in AWS/EC2',
        runbook_url: '',
        dashboard_url: ''
      }
    }]
  }]
}
```

#### `parseDimensions(jsonString)`

Parses and validates CloudWatch dimensions JSON string.

**Parameters:**
- `jsonString` (string): JSON string containing dimensions array

**Returns:**
- `Array`: Parsed dimensions array

**Throws:**
- `Error`: If JSON is invalid or malformed

**Example:**
```javascript
const dimensionsJson = '[{"Name": "InstanceId", "Value": "i-1234567890abcdef0"}]';
const dimensions = translator.parseDimensions(dimensionsJson);
console.log(dimensions);
// Output: [{ Name: 'InstanceId', Value: 'i-1234567890abcdef0' }]
```

#### `getSupportedMetrics()`

Returns the mapping of supported CloudWatch metrics to Prometheus metrics.

**Returns:**
- `Object`: Supported metrics by namespace

**Example:**
```javascript
const supportedMetrics = translator.getSupportedMetrics();
console.log(supportedMetrics);
```

**Output:**
```javascript
{
  'AWS/EC2': {
    'CPUUtilization': 'aws_ec2_cpu_utilization_percent',
    'NetworkIn': 'aws_ec2_network_in_bytes',
    'NetworkOut': 'aws_ec2_network_out_bytes',
    'DiskReadOps': 'aws_ec2_disk_read_ops_total',
    'DiskWriteOps': 'aws_ec2_disk_write_ops_total'
  },
  'AWS/RDS': {
    'CPUUtilization': 'aws_rds_cpu_utilization_percent',
    'DatabaseConnections': 'aws_rds_database_connections',
    'FreeableMemory': 'aws_rds_freeable_memory_bytes',
    'FreeStorageSpace': 'aws_rds_free_storage_space_bytes'
  },
  // ... more services
}
```

### Private Methods

#### `validateInput(alarm)`

Validates input parameters for a CloudWatch alarm.

**Parameters:**
- `alarm` (Object): CloudWatch alarm configuration

**Throws:**
- `Error`: If validation fails

**Validation Rules:**
- Required fields: `alarmName`, `metricName`, `namespace`, `statistic`, `threshold`
- `threshold` must be a positive number
- `period` must be at least 60 seconds
- `evaluationPeriods` and `datapointsToAlarm` must be at least 1
- `datapointsToAlarm` cannot be greater than `evaluationPeriods`

#### `convertToPrometheusMetric(namespace, metricName)`

Converts CloudWatch namespace and metric name to Prometheus metric.

**Parameters:**
- `namespace` (string): CloudWatch namespace
- `metricName` (string): CloudWatch metric name

**Returns:**
- `string`: Prometheus metric name

**Example:**
```javascript
const prometheusMetric = translator.convertToPrometheusMetric('AWS/EC2', 'CPUUtilization');
// Returns: 'aws_ec2_cpu_utilization_percent'
```

#### `buildGrafanaQuery(metric, statistic, period, dimensions)`

Builds Grafana query expression.

**Parameters:**
- `metric` (string): Prometheus metric name
- `statistic` (string): CloudWatch statistic
- `period` (number): Period in seconds
- `dimensions` (Array): CloudWatch dimensions

**Returns:**
- `string`: Grafana query expression

**Example:**
```javascript
const query = translator.buildGrafanaQuery(
  'aws_ec2_cpu_utilization_percent',
  'Average',
  300,
  [{ Name: 'InstanceId', Value: 'i-1234567890abcdef0' }]
);
// Returns: 'avg_over_time(aws_ec2_cpu_utilization_percent{InstanceId="i-1234567890abcdef0"})'
```

#### `convertStatistic(statistic, period)`

Converts CloudWatch statistic to Prometheus function.

**Parameters:**
- `statistic` (string): CloudWatch statistic
- `period` (number): Period in seconds

**Returns:**
- `string|null`: Prometheus function or null

**Supported Statistics:**
- `Average` → `avg_over_time`
- `Sum` → `sum_over_time`
- `Minimum` → `min_over_time`
- `Maximum` → `max_over_time`

#### `convertEvaluationPeriods(evaluationPeriods, datapointsToAlarm, period)`

Converts evaluation periods to Grafana 'for' duration.

**Parameters:**
- `evaluationPeriods` (number): Number of evaluation periods
- `datapointsToAlarm` (number): Number of datapoints to alarm
- `period` (number): Period in seconds

**Returns:**
- `string`: Duration string for Grafana

**Example:**
```javascript
const duration = translator.convertEvaluationPeriods(2, 2, 300);
// Returns: '10m'
```

#### `buildLabels(alarm)`

Builds labels for the alert rule.

**Parameters:**
- `alarm` (Object): CloudWatch alarm configuration

**Returns:**
- `Object`: Labels object

**Default Labels:**
- `severity`: 'warning'
- `source`: 'cloudwatch'
- `namespace`: CloudWatch namespace
- `metric`: CloudWatch metric name
- Dimension labels (converted to lowercase)

#### `buildAnnotations(alarm)`

Builds annotations for the alert rule.

**Parameters:**
- `alarm` (Object): CloudWatch alarm configuration

**Returns:**
- `Object`: Annotations object

**Default Annotations:**
- `summary`: Alert summary
- `description`: Alert description
- `runbook_url`: Empty string
- `dashboard_url`: Empty string

## CloudWatchTranslatorApp Class

The main application class that handles the web interface.

### Constructor

```javascript
const app = new CloudWatchTranslatorApp();
```

Creates a new instance of the CloudWatchTranslatorApp class.

### Methods

#### `translateAlert()`

Translates the current JSON input to Grafana alert YAML.

**Process:**
1. Validates JSON input
2. Parses CloudWatch alarm data
3. Translates to Grafana alert rule
4. Converts to YAML format
5. Displays result

#### `convertToYAML(obj, indent)`

Converts JavaScript object to YAML format.

**Parameters:**
- `obj` (Object): JavaScript object to convert
- `indent` (number): Current indentation level (default: 0)

**Returns:**
- `string`: YAML formatted string

#### `formatYAMLValue(value)`

Formats values for YAML output.

**Parameters:**
- `value` (any): Value to format

**Returns:**
- `string`: Formatted value for YAML

#### `populateExample()`

Populates the input textarea with example CloudWatch alarm JSON.

#### `showError(message)`

Displays an error message to the user.

**Parameters:**
- `message` (string): Error message to display

#### `copyToClipboard()`

Copies the current YAML output to the clipboard.

## Global Functions

### `populateExample()`

Global function to populate example data (called from HTML).

### `clearInput()`

Global function to clear input and output (called from HTML).

## Error Handling

### Common Errors

#### Validation Errors
- **Missing required field**: When a required field is missing or empty
- **Invalid threshold**: When threshold is negative
- **Invalid period**: When period is less than 60 seconds
- **Invalid evaluation periods**: When datapoints to alarm exceeds evaluation periods

#### JSON Parsing Errors
- **Invalid JSON format**: When the input is not valid JSON
- **Invalid dimensions**: When dimensions array is malformed

#### Translation Errors
- **Unsupported metric**: When a metric is not in the supported list (falls back to snake_case conversion)
- **Invalid statistic**: When statistic is not supported (returns null)

### Error Response Format

All errors are thrown as JavaScript Error objects with descriptive messages:

```javascript
try {
  const result = translator.translateToGrafanaAlert(alarm);
} catch (error) {
  console.error('Translation failed:', error.message);
}
```

## Usage Examples

### Basic Usage

```javascript
// Create translator instance
const translator = new AlertTranslator();

// Define CloudWatch alarm
const alarm = {
  alarmName: 'HighCPUUtilization',
  metricName: 'CPUUtilization',
  namespace: 'AWS/EC2',
  statistic: 'Average',
  period: 300,
  threshold: 80.0,
  comparisonOperator: 'GreaterThanThreshold',
  evaluationPeriods: 2,
  datapointsToAlarm: 2,
  dimensions: [
    { Name: 'InstanceId', Value: 'i-1234567890abcdef0' }
  ]
};

// Translate to Grafana alert
const grafanaAlert = translator.translateToGrafanaAlert(alarm);
console.log(JSON.stringify(grafanaAlert, null, 2));
```

### Batch Processing

```javascript
const alarms = [
  // ... multiple alarm configurations
];

const results = alarms.map(alarm => {
  try {
    return translator.translateToGrafanaAlert(alarm);
  } catch (error) {
    console.error(`Failed to translate ${alarm.alarmName}:`, error.message);
    return null;
  }
}).filter(result => result !== null);
```

### Custom Metric Support

```javascript
const customAlarm = {
  alarmName: 'CustomMetricAlert',
  metricName: 'ResponseTime',
  namespace: 'MyApplication',
  statistic: 'Average',
  period: 300,
  threshold: 2000.0,
  comparisonOperator: 'GreaterThanThreshold',
  evaluationPeriods: 2,
  datapointsToAlarm: 2,
  dimensions: [
    { Name: 'Environment', Value: 'Production' }
  ]
};

// This will use fallback naming: myapplication_responsetime
const result = translator.translateToGrafanaAlert(customAlarm);
```

## Browser Compatibility

The translator is compatible with modern browsers that support:
- ES6+ features (classes, arrow functions, template literals)
- Fetch API (for clipboard operations)
- CSS Grid and Flexbox

**Minimum Requirements:**
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations

- **Client-Side Processing**: All translation happens in the browser
- **No Network Requests**: No data is sent to external servers
- **Efficient Parsing**: Uses native JSON.parse for input validation
- **Memory Usage**: Minimal memory footprint for typical alarm configurations

## Security

- **No Data Transmission**: All processing is done locally
- **Input Validation**: Comprehensive validation prevents malicious input
- **XSS Protection**: Output is properly escaped and sanitized
- **No External Dependencies**: Self-contained with no external API calls
