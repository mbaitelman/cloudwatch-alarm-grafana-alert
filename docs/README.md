# Documentation

Welcome to the CloudWatch to Grafana Alert Translator documentation. This folder contains comprehensive guides and examples to help you effectively use the tool.

## 📚 Documentation Index

### [Example Alarms](./example-alarms.md)
Comprehensive collection of CloudWatch alarm examples with:
- JSON format for the translator
- AWS CLI commands to create alarms
- Real-world scenarios for EC2, RDS, ELB, S3, Lambda, and more
- Best practices and usage tips

### [API Reference](./api-reference.md)
Complete API documentation for the AlertTranslator class including:
- Method signatures and parameters
- Return values and error handling
- Code examples and usage patterns

### [Grafana Integration](./grafana-integration.md)
Guide for integrating translated alerts with Grafana:
- Importing alert rules
- Configuring Prometheus data sources
- Setting up notification channels
- Dashboard integration

### [Troubleshooting](./troubleshooting.md)
Common issues and solutions:
- JSON parsing errors
- Validation failures
- Translation problems
- Performance considerations

## 🚀 Quick Start

1. **Basic Usage**: Open the web application and paste your CloudWatch alarm JSON
2. **Example Data**: Use the "Load Example" button to see a sample alarm
3. **Translation**: Click "Translate to Grafana Alert" to get YAML output
4. **Copy**: Use the "Copy to Clipboard" button to copy the result

## 📖 Key Features

- **Client-Side Processing**: All translation happens in your browser
- **YAML Output**: Standard Grafana alert rule format
- **Comprehensive Validation**: Input validation with helpful error messages
- **Multiple AWS Services**: Support for EC2, RDS, ELB, S3, Lambda, and more
- **Custom Metrics**: Support for custom namespaces and metrics

## 🔧 Supported AWS Services

| Service | Namespace | Key Metrics |
|---------|-----------|-------------|
| **EC2** | `AWS/EC2` | CPUUtilization, NetworkIn, NetworkOut, DiskReadOps, DiskWriteOps |
| **RDS** | `AWS/RDS` | CPUUtilization, DatabaseConnections, FreeableMemory, FreeStorageSpace |
| **ELB** | `AWS/ELB` | RequestCount, Latency, HTTPCode_Target_2XX_Count, HTTPCode_Target_4XX_Count, HTTPCode_Target_5XX_Count |
| **S3** | `AWS/S3` | BucketSizeBytes, NumberOfObjects, 4xxErrors, 5xxErrors |
| **Lambda** | `AWS/Lambda` | Invocations, Errors, Duration, Throttles |
| **Logs** | `AWS/Logs` | IncomingLogEvents, IncomingBytes |
| **Custom** | Any | Any custom metric |

## 📝 Input Format

The translator accepts CloudWatch alarm JSON in this format:

```json
{
  "alarmName": "string",
  "metricName": "string", 
  "namespace": "string",
  "statistic": "Average|Sum|Minimum|Maximum",
  "period": number,
  "threshold": number,
  "comparisonOperator": "GreaterThanThreshold|LessThanThreshold|GreaterThanOrEqualToThreshold|LessThanOrEqualToThreshold",
  "evaluationPeriods": number,
  "datapointsToAlarm": number,
  "dimensions": [
    {"Name": "string", "Value": "string"}
  ]
}
```

## 🎯 Output Format

The translator produces Grafana alert rules in YAML format:

```yaml
groups:
- name: cloudwatch-alerts
  rules:
  - alert: AlarmName
    expr: prometheus_query_expression
    for: duration
    labels:
      severity: warning
      source: cloudwatch
      # ... additional labels
    annotations:
      summary: Alert summary
      description: Alert description
      # ... additional annotations
```

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Code Coverage
```bash
npm run test:coverage
```

### Linting
```bash
npm run lint
```

### Local Development Server
```bash
npm run serve
```

## 📞 Support

- **Issues**: Report bugs via [GitHub Issues](https://github.com/yourusername/cloudwatch-alarm-grafana-alert/issues)
- **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/yourusername/cloudwatch-alarm-grafana-alert/discussions)
- **Documentation**: Check this docs folder for detailed guides

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Happy Translating!** 🎉
