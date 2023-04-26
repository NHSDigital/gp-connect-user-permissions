resource "aws_ecs_cluster" "fargate-cluster" {
  name = var.prefix
}

output "cluster_id" {
  value = aws_ecs_cluster.fargate-cluster.id
}
