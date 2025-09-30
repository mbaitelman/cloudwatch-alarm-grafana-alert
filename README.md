# AWS CloudWatch to Grafana Alert Translator

A web application that translates AWS CloudWatch alarms to Grafana alerts for Prometheus backends. All processing is done client-side in your browser, ensuring your data never leaves your machine.

🚀 **Live Demo**: [Try it now on GitHub Pages](https://yourusername.github.io/cloudwatch-alarm-grafana-alert/)

![Application Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=CloudWatch+to+Grafana+Translator)

## Features

- 🔄 **Client-Side Processing**: All translation happens in your browser - no data sent to external servers
- 🎯 **Accurate Translation**: Converts CloudWatch alarm configurations to valid Grafana alert rules
- 🏷️ **Smart Mapping**: Automatically maps CloudWatch metrics to Prometheus metric names
- 📊 **Multiple Statistics**: Supports Average, Sum, Minimum, and Maximum statistics
- 🔧 **Dimension Support**: Handles CloudWatch dimensions and converts them to Prometheus labels
- ✅ **Input Validation**: Comprehensive validation with helpful error messages
- 📋 **Easy Copy**: One-click copy to clipboard functionality
- 🧪 **Fully Tested**: Comprehensive test suite with 80%+ code coverage

## Supported AWS Services

- **EC2**: CPU Utilization, Network I/O, Disk Operations
- **RDS**: CPU Utilization, Database Connections, Memory, Storage
- **ELB**: Request Count, Latency, HTTP Status Codes
- **S3**: Bucket Size, Object Count

## Quick Start

### Option 1: Direct Browser Usage

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/cloudwatch-alarm-grafana-alert.git
   cd cloudwatch-alarm-grafana-alert
   ```

2. Open `index.html` in your web browser
3. Fill in your CloudWatch alarm details
4. Click "Translate to Grafana Alert"
5. Copy the generated alert rule to your Grafana configuration

### Option 2: Local Development Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run serve
   ```

3. Open your browser to `http://localhost:8080`

## Usage

### Full-Screen JSON Input

The application now features a streamlined full-screen interface where you can paste your complete CloudWatch alarm JSON configuration. This makes it much easier to work with complex alarm configurations and copy-paste directly from AWS CloudFormation templates or AWS CLI outputs.

### Input Format

Simply paste your CloudWatch alarm JSON into the left panel. The application accepts both manual JSON format and exported CloudWatch alarm format:

### Settings Configuration

The translator includes several configurable options:

- **Folder**: Customize the folder name for organizing your alerts (default: "CloudWatch Alerts")
- **No Data State**: Choose how to handle missing data (NoData, Alerting, or OK)
- **Metric Format**: Select between YACE or Push Metric format (saved in localStorage for persistence)

**Manual Format (recommended):**
```json
{
  "alarmName": "HighCPUUtilization",
  "metricName": "CPUUtilization",
  "namespace": "AWS/EC2",
  "statistic": "Average",
  "period": 300,
  "threshold": 80.0,
  "comparisonOperator": "GreaterThanThreshold",
  "evaluationPeriods": 2,
  "datapointsToAlarm": 2,
  "dimensions": [
    {"Name": "InstanceId", "Value": "i-1234567890abcdef0"}
  ]
}
```

**Exported Format (from AWS CLI):**
```json
{
  "AlarmName": "HighCPUUtilization",
  "MetricName": "CPUUtilization",
  "Namespace": "AWS/EC2",
  "Statistic": "Average",
  "Period": 300,
  "Threshold": 80.0,
  "ComparisonOperator": "GreaterThanThreshold",
  "EvaluationPeriods": 2,
  "DatapointsToAlarm": 2,
  "Dimensions": [
    {"Name": "InstanceId", "Value": "i-1234567890abcdef0"}
  ]
}
```

**Export an alarm from CloudWatch:**
```bash
aws cloudwatch describe-alarms --alarm-names "YourAlarmName" --output json
```

### Supported Fields

| Field | Description | Example |
|-------|-------------|---------|
| **alarmName** | Name of your CloudWatch alarm | `"HighCPUUtilization"` |
| **metricName** | CloudWatch metric name | `"CPUUtilization"` |
| **namespace** | CloudWatch namespace | `"AWS/EC2"` |
| **statistic** | Statistical function | `"Average"`, `"Sum"`, `"Minimum"`, `"Maximum"` |
| **period** | Evaluation period in seconds | `300` (5 minutes) |
| **threshold** | Alarm threshold value | `80.0` |
| **comparisonOperator** | How to compare metric to threshold | `"GreaterThanThreshold"` |
| **evaluationPeriods** | Number of periods to evaluate | `2` |
| **datapointsToAlarm** | Number of datapoints that must breach | `2` |
| **dimensions** | Array of dimension objects | `[{"Name": "InstanceId", "Value": "i-1234567890abcdef0"}]` |

### Keyboard Shortcuts

- **Ctrl+Enter**: Translate the JSON to Grafana alert
- **Load Example**: Populate with a sample CloudWatch alarm
- **Clear**: Clear the input and output

### Quick Reference

**Required Fields:**
- `alarmName` (string): Name of the alarm
- `metricName` (string): CloudWatch metric name
- `namespace` (string): CloudWatch namespace (e.g., "AWS/EC2")
- `statistic` (string): "Average", "Sum", "Minimum", or "Maximum"
- `threshold` (number): Alarm threshold value

**Optional Fields:**
- `period` (number): Evaluation period in seconds (default: 300)
- `comparisonOperator` (string): Comparison type (default: "GreaterThanThreshold")
- `evaluationPeriods` (number): Number of periods to evaluate (default: 2)
- `datapointsToAlarm` (number): Datapoints that must breach (default: 2)
- `dimensions` (array): Array of dimension objects

### Example Output

The application now outputs Grafana alert rules in YAML format, which is the standard format for Grafana alerting configurations:

```yaml
groups:
- name: production-alerts-alerts
  interval: 1m
  rules:
  - alert: HighCPUUtilization
    expr: "avg_over_time(aws_ec2_cpu_utilization_percent{InstanceId=\"i-1234567890abcdef0\"}) > 80"
    for: 10m
    labels:
      severity: warning
      source: cloudwatch
      namespace: AWS/EC2
      metric: CPUUtilization
      instanceid: i-1234567890abcdef0
    annotations:
      summary: HighCPUUtilization alert
      description: CloudWatch alarm HighCPUUtilization for CPUUtilization in AWS/EC2
      runbook_url: ""
      dashboard_url: ""
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Test Coverage

The project maintains high test coverage with comprehensive unit tests covering:

- ✅ Basic alarm translation
- ✅ Dimension handling
- ✅ Statistics conversion
- ✅ Evaluation period calculations
- ✅ Input validation
- ✅ Error handling
- ✅ Edge cases

### Project Structure

```
├── index.html              # Main HTML file
├── styles.css              # CSS styles
├── app.js                  # Main application logic
├── alertTranslator.js      # Core translation logic
├── tests/
│   └── alertTranslator.test.js  # Unit tests
├── .github/
│   └── workflows/
│       └── test.yml        # GitHub Actions workflow
├── package.json            # Node.js dependencies
├── jest.config.js          # Jest configuration
└── .eslintrc.js           # ESLint configuration
```

## API Reference

### AlertTranslator Class

#### `translateToGrafanaAlert(cloudWatchAlarm)`

Translates a CloudWatch alarm configuration to a Grafana alert rule.

**Parameters:**
- `cloudWatchAlarm` (Object): CloudWatch alarm configuration

**Returns:**
- `Object`: Grafana alert rule in YAML format

**Throws:**
- `Error`: If validation fails or translation encounters an error

#### `parseDimensions(jsonString)`

Parses and validates CloudWatch dimensions JSON string.

**Parameters:**
- `jsonString` (string): JSON string containing dimensions array

**Returns:**
- `Array`: Parsed dimensions array

**Throws:**
- `Error`: If JSON is invalid or malformed

#### `getSupportedMetrics()`

Returns the mapping of supported CloudWatch metrics to Prometheus metrics.

**Returns:**
- `Object`: Supported metrics by namespace

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Ensure all tests pass and coverage is maintained
6. Commit your changes: `git commit -am 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

### Development Guidelines

- Follow the existing code style (ESLint configuration provided)
- Write tests for new functionality
- Maintain test coverage above 80%
- Update documentation for API changes
- Use meaningful commit messages

## GitHub Actions

This repository includes a comprehensive GitHub Actions workflow that:

- 🧪 **Runs tests** on multiple Node.js versions (16.x, 18.x, 20.x)
- 🔍 **Lints code** using ESLint
- 📊 **Generates coverage reports** with detailed metrics
- 🔒 **Security scanning** with npm audit
- ✅ **Build verification** with HTML validation

The workflow triggers on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

### GitHub Pages (Recommended)

The application is automatically deployed to GitHub Pages using GitHub Actions:

1. **Fork this repository**
2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: GitHub Actions
3. **Push to main branch** - The deployment will happen automatically

The site will be available at: `https://yourusername.github.io/cloudwatch-alarm-grafana-alert/`

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/cloudwatch-alarm-grafana-alert.git
cd cloudwatch-alarm-grafana-alert

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run serve
```

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- 📚 **[Documentation Index](./docs/README.md)** - Complete documentation overview
- 🔧 **[Example Alarms](./docs/example-alarms.md)** - Real-world CloudWatch alarm examples with CLI commands
- 📖 **[API Reference](./docs/api-reference.md)** - Complete API documentation
- 🔗 **[Grafana Integration](./docs/grafana-integration.md)** - Guide for integrating with Grafana and Prometheus
- 🛠️ **[Troubleshooting](./docs/troubleshooting.md)** - Common issues and solutions

## Support

- 📖 **Documentation**: Check the [docs folder](./docs/) for comprehensive guides
- 🐛 **Issues**: Report bugs via [GitHub Issues](https://github.com/yourusername/cloudwatch-alarm-grafana-alert/issues)
- 💬 **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/yourusername/cloudwatch-alarm-grafana-alert/discussions)

## Acknowledgments

- AWS CloudWatch for the monitoring foundation
- Grafana for the alerting capabilities
- Prometheus for the metrics backend
- The open-source community for inspiration and tools
