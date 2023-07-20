resource "aws_lb_target_group" "http_mock_provider_tg" {
  depends_on  = [aws_lb.alb]
  name        = var.short_prefix
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    path = "/_status"
  }
}
