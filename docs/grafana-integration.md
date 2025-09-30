# Grafana Integration Guide

This guide explains how to integrate the translated CloudWatch alerts with Grafana and Prometheus.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Prometheus Configuration](#prometheus-configuration)
- [Grafana Setup](#grafana-setup)
- [Importing Alert Rules](#importing-alert-rules)
- [Configuring Data Sources](#configuring-data-sources)
- [Setting Up Notifications](#setting-up-notifications)
- [Dashboard Integration](#dashboard-integration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before integrating with Grafana, ensure you have:

- **Prometheus** running and configured to scrape AWS CloudWatch metrics
- **Grafana** installed and accessible
- **AWS credentials** configured for Prometheus to access CloudWatch
- **CloudWatch Exporter** or similar tool to expose CloudWatch metrics to Prometheus

## Prometheus Configuration

### 1. Install CloudWatch Exporter

The CloudWatch Exporter allows Prometheus to scrape AWS CloudWatch metrics.

```bash
# Download the CloudWatch Exporter
wget https://github.com/prometheus/cloudwatch_exporter/releases/download/v0.15.7/cloudwatch_exporter-0.15.7-jar-with-dependencies.jar

# Create configuration file
cat > cloudwatch_exporter.yml << EOF
region: us-west-2
metrics:
  - aws_namespace: AWS/EC2
    aws_metric_name: CPUUtilization
    aws_dimensions: [InstanceId]
    aws_statistics: [Average]
    range_seconds: 300
  - aws_namespace: AWS/RDS
    aws_metric_name: CPUUtilization
    aws_dimensions: [DBInstanceIdentifier]
    aws_statistics: [Average]
    range_seconds: 300
  - aws_namespace: AWS/ELB
    aws_metric_name: Latency
    aws_dimensions: [LoadBalancerName]
    aws_statistics: [Average]
    range_seconds: 300
EOF
```

### 2. Configure AWS Credentials

```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-west-2

# Or use IAM roles (recommended for production)
```

### 3. Start CloudWatch Exporter

```bash
java -jar cloudwatch_exporter-0.15.7-jar-with-dependencies.jar 9106 cloudwatch_exporter.yml
```

### 4. Configure Prometheus

Add the CloudWatch Exporter to your `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'cloudwatch'
    static_configs:
      - targets: ['localhost:9106']
    scrape_interval: 60s
    metrics_path: /metrics
```

## Grafana Setup

### 1. Install Grafana

```bash
# Ubuntu/Debian
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
sudo apt-get update
sudo apt-get install grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

### 2. Access Grafana

Open your browser and navigate to `http://localhost:3000`

- **Default username**: `admin`
- **Default password**: `admin`

## Importing Alert Rules

### 1. Navigate to Alerting

1. Go to **Alerting** → **Alert Rules** in Grafana
2. Click **New Rule**

### 2. Create Alert Rule

1. **Rule Name**: Enter the alert name from your translated YAML
2. **Folder**: Select or create a folder (e.g., "CloudWatch Alerts")
3. **Group**: Enter the group name (e.g., "cloudwatch-alerts")

### 3. Configure Query

1. **Data Source**: Select your Prometheus data source
2. **Query**: Paste the `expr` value from your translated YAML

Example:
```promql
avg_over_time(aws_ec2_cpu_utilization_percent{InstanceId="i-1234567890abcdef0"})
```

### 4. Set Conditions

1. **Condition**: Set the threshold condition
2. **For**: Set the duration (e.g., "10m")
3. **Labels**: Add the labels from your translated YAML
4. **Annotations**: Add the annotations from your translated YAML

### 5. Save Rule

Click **Save** to create the alert rule.

## Configuring Data Sources

### 1. Add Prometheus Data Source

1. Go to **Configuration** → **Data Sources**
2. Click **Add data source**
3. Select **Prometheus**

### 2. Configure Connection

```yaml
Name: Prometheus
URL: http://localhost:9090
Access: Server (default)
```

### 3. Test Connection

Click **Test** to verify the connection works.

## Setting Up Notifications

### 1. Create Notification Channel

1. Go to **Alerting** → **Notification channels**
2. Click **New channel**

### 2. Configure Channel

**Email Example:**
```yaml
Name: Email Alerts
Type: Email
Email addresses: admin@company.com,ops@company.com
```

**Slack Example:**
```yaml
Name: Slack Alerts
Type: Slack
Webhook URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
Channel: #alerts
```

**PagerDuty Example:**
```yaml
Name: PagerDuty
Type: PagerDuty
Integration Key: YOUR_PAGERDUTY_INTEGRATION_KEY
```

### 3. Test Notification

Click **Test** to send a test notification.

## Dashboard Integration

### 1. Create Dashboard

1. Go to **Dashboards** → **New**
2. Click **Add visualization**

### 2. Add CloudWatch Metrics

1. **Data Source**: Select Prometheus
2. **Query**: Use the same query from your alert rules

Example queries:
```promql
# CPU Utilization
aws_ec2_cpu_utilization_percent{InstanceId="i-1234567890abcdef0"}

# Memory Utilization
aws_ec2_memory_utilization_percent{InstanceId="i-1234567890abcdef0"}

# Network Traffic
aws_ec2_network_in_bytes{InstanceId="i-1234567890abcdef0"}

# Database Connections
aws_rds_database_connections{DBInstanceIdentifier="my-db-instance"}
```

### 3. Configure Visualization

1. **Visualization Type**: Choose appropriate type (Time series, Stat, Gauge, etc.)
2. **Panel Title**: Set descriptive title
3. **Unit**: Set appropriate unit (Percent, Bytes, Count, etc.)

### 4. Add Alert Thresholds

1. Go to **Panel** → **Alert**
2. **Create Alert**: Enable alerting
3. **Conditions**: Set threshold conditions
4. **Notifications**: Select notification channels

## Complete Example

Here's a complete example of integrating a translated CloudWatch alarm:

### 1. Original CloudWatch Alarm

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

### 2. Translated Grafana Alert

```yaml
groups:
- name: cloudwatch-alerts
  rules:
  - alert: HighCPUUtilization
    expr: avg_over_time(aws_ec2_cpu_utilization_percent{InstanceId="i-1234567890abcdef0"})
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
```

### 3. Grafana Configuration

**Alert Rule:**
- **Name**: HighCPUUtilization
- **Query**: `avg_over_time(aws_ec2_cpu_utilization_percent{InstanceId="i-1234567890abcdef0"})`
- **Condition**: `IS ABOVE 80`
- **For**: `10m`
- **Labels**: `severity=warning, source=cloudwatch`
- **Annotations**: `summary=HighCPUUtilization alert`

**Dashboard Panel:**
- **Title**: EC2 CPU Utilization
- **Query**: `aws_ec2_cpu_utilization_percent{InstanceId="i-1234567890abcdef0"}`
- **Visualization**: Time series
- **Unit**: Percent (0-100)
- **Thresholds**: 80 (warning), 90 (critical)

## Troubleshooting

### Common Issues

#### 1. No Data in Grafana

**Problem**: Grafana shows "No data" for CloudWatch metrics.

**Solutions:**
- Verify Prometheus is scraping CloudWatch Exporter
- Check AWS credentials and permissions
- Ensure CloudWatch Exporter configuration is correct
- Verify metric names and dimensions match

#### 2. Alert Rules Not Firing

**Problem**: Alert rules are created but not firing.

**Solutions:**
- Check query syntax in Grafana
- Verify metric names exist in Prometheus
- Ensure threshold values are appropriate
- Check evaluation intervals

#### 3. Missing Metrics

**Problem**: Some CloudWatch metrics are not available in Prometheus.

**Solutions:**
- Add missing metrics to CloudWatch Exporter configuration
- Check AWS permissions for metric access
- Verify metric names and namespaces
- Ensure metrics are being published to CloudWatch

#### 4. High Cardinality

**Problem**: Too many metrics causing performance issues.

**Solutions:**
- Filter metrics in CloudWatch Exporter configuration
- Use metric relabeling in Prometheus
- Limit dimensions and time ranges
- Consider metric aggregation

### Debugging Steps

1. **Check Prometheus Targets**:
   ```bash
   curl http://localhost:9090/api/v1/targets
   ```

2. **Verify CloudWatch Exporter**:
   ```bash
   curl http://localhost:9106/metrics
   ```

3. **Test Prometheus Queries**:
   ```bash
   curl 'http://localhost:9090/api/v1/query?query=aws_ec2_cpu_utilization_percent'
   ```

4. **Check Grafana Logs**:
   ```bash
   sudo journalctl -u grafana-server -f
   ```

### Performance Optimization

1. **Scrape Intervals**: Adjust scrape intervals based on metric volatility
2. **Metric Filtering**: Only scrape necessary metrics
3. **Retention**: Configure appropriate data retention policies
4. **Resource Limits**: Set appropriate resource limits for Prometheus and Grafana

## Best Practices

1. **Naming Conventions**: Use consistent naming for alert rules and dashboards
2. **Alert Grouping**: Group related alerts together
3. **Severity Levels**: Use appropriate severity levels (warning, critical)
4. **Documentation**: Document alert rules and their purposes
5. **Testing**: Test alert rules with synthetic data
6. **Monitoring**: Monitor the monitoring system itself
7. **Backup**: Regularly backup Grafana configurations
8. **Updates**: Keep Grafana and Prometheus updated

## Security Considerations

1. **Access Control**: Use Grafana's built-in access control
2. **Authentication**: Enable authentication and authorization
3. **Network Security**: Secure network access to Grafana and Prometheus
4. **Credentials**: Use IAM roles instead of access keys when possible
5. **Encryption**: Enable TLS for Grafana and Prometheus
6. **Audit Logging**: Enable audit logging for compliance

---

This guide provides a comprehensive approach to integrating CloudWatch alerts with Grafana. For additional help, refer to the [Troubleshooting Guide](./troubleshooting.md) or check the official Grafana and Prometheus documentation.
