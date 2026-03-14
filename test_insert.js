import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ivcsftaiwotazxvxxrxo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2Y3NmdGFpd290YXp4dnh4cnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzMxMjAsImV4cCI6MjA4OTA0OTEyMH0.eMzdyQRbittFxfXptZ-OlVbNimmsFDcjG0W6TaM-R9s'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Testing Supabase Insert...')
  const newFunc = {
    nome: 'Teste Funcionario ' + Date.now(),
    funcao: 'midia',
    nivel: 'experiente',
    escalas: 0
  }

  const { data, error } = await supabase.from('funcionarios').insert([newFunc]).select()

  if (error) {
    console.error('Insert Failed:', error)
  } else {
    console.log('Insert Success:', data)
  }
}

test()
