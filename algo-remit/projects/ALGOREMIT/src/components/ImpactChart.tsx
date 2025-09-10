import { Chart as ChartJS, ChartOptions, ChartType } from 'chart.js/auto'
import { useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiDownload } from 'react-icons/fi'

const chartTypes: ChartType[] = ['doughnut', 'line']

const ImpactChart = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<ChartJS | null>(null)
  const [chartType, setChartType] = useState<ChartType>('doughnut')

  const handleExport = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `impact-${chartType}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  useEffect(() => {
    if (!canvasRef.current) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const data = {
      labels: ['Traditional', 'AlgoRemit'],
      datasets: [
        {
          label: 'Fees Saved ($M)',
          data: [0, 50],
          backgroundColor: chartType === 'doughnut' ? ['#f5e7d4', '#d97706'] : ['rgba(245, 231, 212, 0.2)', 'rgba(217, 119, 6, 0.6)'],
          borderColor: ['#f5e7d4', '#d97706'],
          borderWidth: 2,
          pointBackgroundColor: '#d97706',
          pointBorderColor: '#fff',
          pointRadius: chartType === 'line' ? 5 : 0,
          tension: chartType === 'line' ? 0.4 : 0,
          fill: chartType === 'line',
        },
      ],
    }

    const options: ChartOptions<ChartType> = {
      responsive: true,
      maintainAspectRatio: false,
      scales:
        chartType === 'doughnut'
          ? {}
          : {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Savings ($M)',
                  color: '#92400e',
                  font: { size: 14, family: 'sans-serif', weight: 600 }, // fixed
                },
                ticks: { color: '#92400e', font: { size: 12 } },
                grid: { color: '#f5e7d4' },
              },
              x: {
                title: {
                  display: true,
                  text: 'Remittance Method',
                  color: '#92400e',
                  font: { size: 14, family: 'sans-serif', weight: 600 }, // fixed
                },
                ticks: { color: '#92400e', font: { size: 12 } },
                grid: { display: false },
              },
            },
      plugins: {
        legend: {
          display: chartType === 'doughnut',
          position: 'bottom',
          labels: {
            color: '#92400e',
            font: { size: 12, family: 'sans-serif' },
            padding: 16,
            boxWidth: 12,
          },
        },
        title: {
          display: true,
          text: '$1B Remittance: 10% via AlgoRemit Saves $50M',
          color: '#92400e',
          font: { size: 18, family: 'sans-serif', weight: 'bold' }, // valid keyword
          padding: { top: 10, bottom: 20 },
        },
        tooltip: {
          backgroundColor: '#fef3c7',
          titleColor: '#92400e',
          bodyColor: '#92400e',
          borderColor: '#d97706',
          borderWidth: 1,
          cornerRadius: 8,
        },
      },
      animation: {
        duration: 700,
        easing: 'easeOutQuart',
      },
    }

    chartRef.current = new ChartJS(canvasRef.current, {
      type: chartType as ChartType,
      data,
      options,
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [chartType])

  return (
    <div className="backdrop-blur-md bg-white/80 p-8 rounded-2xl border border-amber-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-amber-900">Impact Visualization</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
              chartType === 'line' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            <FiArrowLeft size={16} /> Line
          </button>
          <button
            onClick={() => setChartType('doughnut')}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
              chartType === 'doughnut' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            Doughnut <FiArrowRight size={16} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
          >
            <FiDownload size={16} /> Export
          </button>
        </div>
      </div>

      <div className="relative h-80">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <p className="text-amber-700 text-center mt-4 text-sm max-w-lg mx-auto">
        Switch between views to see how AlgoRemit saves millions compared to traditional methods.
      </p>
    </div>
  )
}

export default ImpactChart
